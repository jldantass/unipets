begin;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'planos_banho' and column_name = 'porte'
  ) then
    alter table public.planos_banho
      add column porte text,
      add constraint planos_banho_porte_valido check (porte in ('Pequeno', 'Médio', 'Grande'));

    update public.planos_banho set porte = 'Pequeno';

    drop index public.planos_banho_nome_unico;
    create unique index planos_banho_nome_porte_unico
      on public.planos_banho (porte, lower(btrim(nome)));

    insert into public.planos_banho (nome, total_banhos, validade_dias, preco, porte)
      select plano.nome, plano.total_banhos, plano.validade_dias, plano.preco, tamanho.porte
      from public.planos_banho as plano
      cross join (values ('Médio'), ('Grande')) as tamanho(porte)
      where plano.porte = 'Pequeno';

    alter table public.planos_banho alter column porte set not null;
  end if;
end
$$;

commit;
