begin;

do $$
begin
  if to_regclass('public.planos_banho') is null then
    create table public.planos_banho (
      id uuid primary key default gen_random_uuid(),
      nome text not null check (char_length(btrim(nome)) between 1 and 80),
      total_banhos integer not null check (total_banhos between 1 and 365),
      validade_dias integer not null check (validade_dias between 1 and 3650),
      preco numeric(10,2) not null check (preco >= 0 and preco <= 99999999.99)
    );

    create unique index planos_banho_nome_unico
      on public.planos_banho (lower(btrim(nome)));

    insert into public.planos_banho (nome, total_banhos, validade_dias, preco) values
      ('Essencial', 2, 30, 65.00),
      ('Mensal', 4, 30, 120.00),
      ('Flex', 6, 60, 180.00);
  end if;
end
$$;

alter table public.planos_banho enable row level security;

drop policy if exists funcionarios_catalogo on public.planos_banho;
create policy funcionarios_catalogo on public.planos_banho
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on public.planos_banho to authenticated;

commit;
