# Hobby Biches · Sistema de Banhos (versão profissional)

Sistema com **banco de dados real** (Supabase/PostgreSQL), **login por funcionário** e
**atualização em tempo real** entre dispositivos — pronto para usar de verdade ou vender
para outros pet shops.

Você não precisa saber programar para colocar isso no ar. Siga os passos na ordem.
Tempo estimado: 30–40 minutos na primeira vez.

---

## O que você vai criar (e é tudo gratuito para começar)

| Serviço | Para que serve | Custo |
|---|---|---|
| **Supabase** | Banco de dados, login dos funcionários, fotos dos pets | Grátis (plano free cobre um pet shop tranquilamente) |
| **Vercel** | Hospeda o site com um link (ex: hobbybiches.vercel.app) | Grátis |
| **Node.js** | Ferramenta no seu computador para preparar o projeto | Grátis |

---

## Passo 1 — Criar o projeto no Supabase

1. Acesse **https://supabase.com** e crie uma conta gratuita.
2. Clique em **"New project"**.
3. Dê um nome (ex: `hobby-biches`), crie uma senha forte para o banco (guarde-a) e escolha a região mais perto de você (ex: South America).
4. Aguarde ~2 minutos até o projeto ficar pronto.

## Passo 2 — Criar as tabelas do banco de dados

1. No menu lateral do Supabase, clique em **"SQL Editor"**.
2. Clique em **"New query"**.
3. Abra o arquivo `supabase/schema.sql` (está nesta pasta que você recebeu), copie **todo o conteúdo** e cole no editor.
4. Clique em **"Run"**. Isso cria as tabelas de clientes, animais, banhos e preços, já com alguns preços de exemplo.

## Passo 3 — Criar o espaço de armazenamento das fotos

1. No menu lateral, clique em **"Storage"**.
2. Clique em **"New bucket"**, nomeie como `fotos-pets`.
3. Marque a opção **"Public bucket"** (assim as fotos aparecem no sistema) e crie.

## Passo 4 — Pegar as chaves de conexão

1. No menu lateral, clique em **"Project Settings" → "API"**.
2. Copie o **"Project URL"** e a chave **"anon public"** — vai precisar delas no Passo 6.

## Passo 5 — Instalar o Node.js no seu computador

1. Baixe em **https://nodejs.org** (escolha a versão **LTS**) e instale normalmente (Next, Next, Concluir).
2. Para conferir se funcionou, abra o Terminal (Mac/Linux) ou Prompt de Comando (Windows) e digite:
   ```
   node -v
   ```
   Deve aparecer um número de versão.

## Passo 6 — Configurar o projeto

1. Extraia a pasta `hobby-biches-app` que você recebeu em algum lugar do seu computador (ex: Área de Trabalho).
2. Dentro dela, encontre o arquivo `.env.example` e faça uma cópia renomeada para `.env`.
3. Abra o `.env` num editor de texto e cole a URL e a chave que você copiou no Passo 4:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-aqui
   ```

## Passo 7 — Rodar o sistema no seu computador (teste local)

1. Abra o Terminal/Prompt de Comando **dentro da pasta** `hobby-biches-app`.
   - Dica: no Windows, entre na pasta pelo Explorador de Arquivos, clique na barra de endereço, digite `cmd` e aperte Enter.
2. Digite:
   ```
   npm install
   ```
   (baixa as peças que o sistema usa — só precisa fazer isso uma vez, demora alguns minutos)
3. Depois digite:
   ```
   npm run dev
   ```
4. Vai aparecer um link tipo `http://localhost:5173`. Abra no navegador — o sistema deve carregar a tela de login.

## Passo 8 — Criar os primeiros funcionários (login)

1. No Supabase, vá em **"Authentication" → "Users"**.
2. Clique em **"Add user" → "Create new user"**.
3. Preencha e-mail e senha para você (e depois para cada funcionário) e marque **"Auto Confirm User"**.
4. Volte no sistema (localhost) e faça login com esse e-mail e senha.

## Passo 9 — Colocar o sistema no ar de verdade (Vercel)

1. Crie uma conta gratuita em **https://vercel.com** (pode entrar com o mesmo e-mail).
2. No Terminal, ainda dentro da pasta do projeto, rode:
   ```
   npm install -g vercel
   vercel login
   vercel
   ```
3. Responda as perguntas com Enter (valores padrão) até o final. Na primeira vez ele te devolve um link de teste.
4. Quando as variáveis do `.env` forem pedidas (ou depois, no site da Vercel em **Project → Settings → Environment Variables**), adicione as mesmas duas chaves do Passo 6.
5. Para publicar a versão final, rode:
   ```
   vercel --prod
   ```
6. Pronto — você recebe um link definitivo (ex: `hobby-biches.vercel.app`) que funciona em qualquer computador ou celular, com os dados sincronizados em tempo real entre todos os funcionários.

> Depois, se quiser, dá pra ligar um domínio próprio (ex: sistema.hobbybiches.com.br) em **Vercel → Settings → Domains**.

---

## Como usar no dia a dia

- **Painel**: mostra os banhos em andamento em tempo real — se um funcionário iniciar um banho, todos os outros dispositivos veem na hora.
- **Cadastro**: cadastra cliente + animal, com foto opcional.
- **Planos**: assina, renova e acompanha o uso dos banhos do plano.
- **Buscar**: por nome do animal, dono, CPF, raça ou telefone.
- **Preços**: a equipe pode consultar e o administrador pode editar os valores direto pela tela — não precisa mexer em código.

## Se quiser vender para outros pet shops

Hoje o sistema atende **um pet shop por projeto Supabase**. Para vender como produto (SaaS) para vários
pet shops diferentes, o próximo passo de arquitetura é adicionar uma tabela `lojas` e uma coluna
`loja_id` em cada tabela, para separar os dados de cada cliente dentro do mesmo banco — posso te ajudar
a construir essa parte quando você chegar lá.

## Problemas comuns

- **Tela de login não carrega / erro no console**: confira se o `.env` está preenchido corretamente e se você rodou `npm install`.
- **"Erro ao salvar" em qualquer tela**: geralmente é porque o Passo 2 (schema.sql) não rodou completo — volte ao SQL Editor e rode de novo.
- **Foto não aparece**: confira se o bucket `fotos-pets` foi criado como **público** (Passo 3).
