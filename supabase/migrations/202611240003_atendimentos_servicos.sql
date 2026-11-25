begin;

alter table public.animais
  add column if not exists plano_catalogo_id uuid references public.planos_banho(id) on delete set null;

alter table public.banhos
  add column if not exists servicos jsonb,
  add column if not exists valor_total numeric(14,2),
  add column if not exists desconto_plano numeric(14,2);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.animais'::regclass and conname = 'animais_plano_catalogo_importado'
  ) then
    update public.animais as animal
    set plano_catalogo_id = plano.id
    from public.planos_banho as plano
    where animal.plano_catalogo_id is null
      and animal.porte = plano.porte
      and lower(btrim(animal.plano_tipo)) = lower(btrim(plano.nome));

    alter table public.animais add constraint animais_plano_catalogo_importado
      check (plano_catalogo_id is null or plano_tipo is not null);
  end if;
end
$$;

create or replace function public.iniciar_servico(
  p_id uuid, p_animal_id uuid, p_servicos uuid[], p_observacoes text,
  p_total_centavos bigint, p_desconto_centavos bigint
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  animal public.animais%rowtype;
  item public.precos%rowtype;
  hoje date := (now() at time zone 'America/Fortaleza')::date;
  itens jsonb := '[]'::jsonb;
  subtotal numeric := 0;
  valor_banho numeric := null;
  base_banho numeric := 0;
  desconto numeric := 0;
  quantidade integer := coalesce(cardinality(p_servicos), 0);
begin
  select * into animal from public.animais where id = p_animal_id for update;
  if not found then raise exception 'Animal indisponível.'; end if;

  if exists (select 1 from public.banhos where id = p_id and animal_id = p_animal_id) then return; end if;
  if exists (select 1 from public.banhos where animal_id = p_animal_id and status = 'em_andamento') then
    raise exception 'Este cachorro já tem um serviço em andamento.';
  end if;
  if quantidade = 0 then raise exception 'Selecione pelo menos um serviço.'; end if;

  for item in
    select p.* from public.precos as p
    where p.id = any(p_servicos) and p.preco between 0 and 99999999.99
      and (coalesce(translate(lower(btrim(p.porte)), 'ÚÉ', 'úé'), '') in ('', 'único', 'unico')
        or translate(lower(btrim(p.porte)), 'ÚÉ', 'úé') = translate(lower(btrim(animal.porte)), 'ÚÉ', 'úé'))
    order by p.id
    for share
  loop
    if lower(btrim(item.categoria)) = 'banho' then
      if valor_banho is not null then raise exception 'Selecione apenas uma opção de banho.'; end if;
      valor_banho := item.preco;
    end if;
    subtotal := subtotal + item.preco;
    itens := itens || jsonb_build_array(jsonb_build_object('nome', item.nome, 'categoria', item.categoria, 'preco', item.preco));
  end loop;

  if jsonb_array_length(itens) <> quantidade then
    raise exception 'Algum serviço selecionado não está disponível para este porte.';
  end if;

  if valor_banho is not null
    and animal.plano_tipo is not null
    and coalesce(animal.plano_banhos_usados, 0) < animal.plano_banhos_totais
    and animal.plano_data_expiracao >= hoje
    and coalesce(animal.plano_data_assinatura, hoje) <= hoje
    and exists (
      select 1 from public.planos_banho as plano
      where plano.id = animal.plano_catalogo_id and plano.porte = animal.porte
    )
  then
    select preco into base_banho
    from public.precos as p
    where lower(btrim(p.categoria)) = 'banho'
      and lower(btrim(p.nome)) in ('banho simples', 'banho')
      and p.preco between 0 and 99999999.99
      and (coalesce(translate(lower(btrim(p.porte)), 'ÚÉ', 'úé'), '') in ('', 'único', 'unico')
        or translate(lower(btrim(p.porte)), 'ÚÉ', 'úé') = translate(lower(btrim(animal.porte)), 'ÚÉ', 'úé'))
    order by (translate(lower(btrim(p.porte)), 'ÚÉ', 'úé') = translate(lower(btrim(animal.porte)), 'ÚÉ', 'úé')) desc nulls last, p.ordem nulls last, p.id
    limit 1
    for share;

    desconto := least(valor_banho, coalesce(base_banho, 0));
  end if;

  if p_total_centavos is distinct from (subtotal - desconto) * 100
    or p_desconto_centavos is distinct from desconto * 100
  then
    raise exception 'O preço ou o saldo mudou. Confira o total atualizado antes de iniciar.';
  end if;

  if desconto > 0 then
    update public.animais set plano_banhos_usados = coalesce(plano_banhos_usados, 0) + 1
    where id = p_animal_id;
  end if;

  insert into public.banhos (id, animal_id, observacoes, servicos, valor_total, desconto_plano)
    values (p_id, p_animal_id, btrim(p_observacoes), itens, subtotal - desconto, desconto);
end
$$;

create or replace function public.finalizar_servico(p_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  pet_id uuid;
  legado boolean;
begin
  select animal_id into pet_id from public.banhos where id = p_id;
  if not found then return; end if;

  perform 1 from public.animais where id = pet_id for update;

  update public.banhos set status = 'finalizado', hora_fim = now()
  where id = p_id and status = 'em_andamento'
  returning servicos is null into legado;

  if legado then
    update public.animais set plano_banhos_usados = coalesce(plano_banhos_usados, 0) + 1
    where id = pet_id and plano_tipo is not null
      and coalesce(plano_banhos_usados, 0) < plano_banhos_totais
      and (plano_data_expiracao is null or plano_data_expiracao >= (now() at time zone 'America/Fortaleza')::date);
  end if;
end
$$;

revoke execute on function public.iniciar_servico(uuid, uuid, uuid[], text, bigint, bigint) from public, anon;
revoke execute on function public.finalizar_servico(uuid) from public, anon;
grant execute on function public.iniciar_servico(uuid, uuid, uuid[], text, bigint, bigint) to authenticated;
grant execute on function public.finalizar_servico(uuid) to authenticated;

commit;
