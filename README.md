# UniPets · Sistema de Banhos do Hobby Biches

Projeto de Extensão para gerenciar os banhos de um pet shop. O sistema permite cadastrar clientes e pets, acompanhar banhos em andamento, gerenciar planos e consultar ou editar preços. A interface usa React e Vite. O Supabase fornece o banco PostgreSQL, a autenticação e o armazenamento de fotos.

## Pré-requisitos

- Git.
- Node.js 22 ou superior, de preferência uma versão LTS, com npm.
- Uma conta no [Supabase](https://supabase.com/) para criar um projeto de teste.

## Instalação e execução local

### 1. Baixe o código e instale as dependências

```bash
git clone https://github.com/jldantass/unipets.git
cd unipets
npm ci
```

### 2. Configure o banco de dados

1. Crie um projeto no painel do Supabase.
2. Abra o **SQL Editor**, crie uma consulta e execute o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) uma vez. O script cria as tabelas, insere preços de exemplo e configura as políticas de acesso e as atualizações em tempo real.
3. Em uma nova consulta, execute o SQL abaixo para conceder ao papel `authenticated` as permissões de tabela usadas pelo aplicativo. As políticas de acesso do script continuam valendo.

```sql
grant select, insert on table public.clientes to authenticated;
grant select, insert, update, delete on table public.animais, public.precos to authenticated;
grant select, insert, update on table public.banhos to authenticated;
```

### 3. Configure o armazenamento de fotos

Se quiser testar o envio de fotos, abra **Storage** no Supabase e crie um bucket público chamado `fotos-pets`. A leitura das fotos funciona por URL pública. Para permitir o envio por usuários logados, execute no **SQL Editor**:

```sql
create policy "Funcionarios podem enviar fotos dos pets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'fotos-pets');
```

### 4. Configure as variáveis de ambiente

Na raiz do repositório, copie [`.env.example`](.env.example) para um arquivo chamado `.env`. No painel do Supabase, abra **Connect** e use a URL do projeto e a chave pública (**Publishable key**). Se seu projeto ainda usa a chave legada `anon`, ela também pode ser usada.

```dotenv
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_sua_chave
```

Mantenha o nome `VITE_SUPABASE_ANON_KEY` como no exemplo. Use apenas a chave pública no frontend. Chaves `service_role` e `sb_secret_...` devem ficar fora do `.env` do aplicativo. [Documentação de chaves do Supabase](https://supabase.com/docs/guides/getting-started/api-keys)

### 5. Crie um usuário de teste

No Supabase, abra **Authentication → Users → Add user → Create new user**. Informe um e-mail e uma senha de teste e marque **Auto Confirm User** para ativar o login imediatamente.

### 6. Inicie o sistema

```bash
npm run dev
```

Abra o endereço exibido no terminal, geralmente `http://localhost:5173`. Entre com o usuário de teste e cadastre um cliente e um pet fictícios. Para conferir o fluxo principal, inicie e finalize um banho no painel.

## Build e publicação opcional

Para gerar e conferir a versão de produção localmente, execute:

```bash
npm run build
npm run preview
```

O build é gerado na pasta `dist`. Para publicar na Vercel, importe o repositório como um projeto Vite e configure as duas variáveis do Supabase em **Settings → Environment Variables** antes do deploy. A execução local funciona sem uma conta na Vercel.
