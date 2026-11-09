# Testes do UniPets

Foram executados **13 testes unitários**, **11 casos funcionais** e **1 teste automatizado de interface**. Todos foram aprovados. Os testes unitários verificam as regras dos planos e da busca. Os casos funcionais verificam o comportamento pela interface. O Selenium automatiza o login no Microsoft Edge e confirma a abertura do Painel de Banhos.

## Testes unitários e cobertura

Execute os comandos abaixo na raiz do projeto com Node.js 22 ou superior.

```powershell
npm.cmd test
npm.cmd run test:coverage
```

O primeiro comando executa os testes com `node:test`. O segundo também mede a cobertura V8 de [`src/lib/helpers.js`](../src/lib/helpers.js). Os testes de vencimento usam uma data fixa e a suíte roda sem Supabase ou navegador.

Na execução com Node.js 24.21.0 no Windows, os **13 testes passaram**. A cobertura de `helpers.js` foi de **85,71% das linhas**, **79,17% dos ramos** e **57,14% das funções**.

## Testes funcionais

Use um projeto Supabase de teste e dados fictícios. Siga as instruções de instalação, crie um usuário de teste e rode o site localmente. Para os testes com fotos, configure o bucket e a política de envio. [Instalação do UniPets](../README.md)

O particionamento de equivalência separa entradas com comportamento esperado semelhante, como e-mails em formato válido ou inválido e nomes com ou sem conteúdo útil. A análise de valor-limite compara nomes com zero e um caractere e fotos com um byte abaixo, exatamente no limite e um byte acima de 2 MiB.

Na raiz do projeto, rode `python tests/gerar_fotos.py` para criar os três PNGs de tamanho exato em `test-evidence/fotos-teste/`.

| ID | Pré-condição | Passos | Entrada | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- |
| F01 | Conta de teste ativa e sessão encerrada | Preencher o formulário e clicar em Entrar | Credenciais válidas | O Painel de Banhos abre | O painel abriu e exibiu a seção Banhos em andamento | Aprovado |
| F02 | Tela de login aberta | Preencher o formulário e clicar em Entrar | E-mail válido e senha incorreta | O sistema recusa o login e mostra um aviso | A mensagem de credenciais inválidas apareceu e a tela de login permaneceu aberta | Aprovado |
| F03 | Tela de login aberta | Tentar enviar o formulário com o e-mail malformado | E-mail sem `@` e senha preenchida | O navegador sinaliza o formato inválido e impede o envio | O navegador informou que faltava `@` | Aprovado |
| F04 | Sessão ativa na aba Cadastro | Preencher só o nome do animal e tentar salvar | Cliente vazio e pet `Luna F04` | O sistema solicita os nomes obrigatórios | O aviso apareceu e Luna F04 não entrou na lista | Aprovado |
| F05 | Sessão ativa na aba Cadastro | Preencher o cliente, digitar três espaços no nome do animal e tentar salvar | Cliente `Ana F05` e nome do pet com três espaços | O sistema rejeita o nome composto só por espaços | O aviso apareceu e a lista manteve 1 cadastro | Aprovado |
| F06 | Sessão ativa na aba Cadastro | Preencher os dois nomes e salvar | Cliente `A` e pet `L` | O sistema aceita um caractere em cada nome | O pet L apareceu com o dono A. O total passou de 1 para 2 | Aprovado |
| F07 | Sessão ativa na aba Cadastro e upload disponível | Selecionar a imagem e salvar | `Luna F07` e PNG de 2.097.151 bytes | O cadastro aparece com a foto | A foto apareceu no cadastro. O total passou de 2 para 3 | Aprovado |
| F08 | Sessão ativa na aba Cadastro e upload disponível | Selecionar a imagem, salvar e conferir a foto | `Luna F08` e PNG de 2.097.152 bytes | O sistema aceita a foto exatamente no limite | O cadastro foi salvo e a foto apareceu no painel após recarregar a página | Aprovado |
| F09 | Sessão ativa na aba Cadastro | Selecionar a imagem acima do limite | PNG de 2.097.153 bytes | O sistema exibe o aviso de tamanho e limpa a seleção | O aviso de tamanho máximo apareceu e o campo ficou sem arquivo selecionado | Aprovado |
| F10 | Pet `LUNA F07` cadastrado | Abrir Buscar e digitar o nome em minúsculas | `luna f07` | A busca encontra o pet independentemente de maiúsculas e minúsculas | O cadastro LUNA F07 apareceu no resultado | Aprovado |
| F11 | Pet `LUNA F07` cadastrado e sem banho em andamento | Iniciar e depois finalizar o banho no painel | Pet `LUNA F07` | O banho entra na lista de andamento e sai dela após finalizar | O pet apareceu durante o banho. Depois da confirmação de finalização, saiu da lista e o contador voltou a zero | Aprovado |

## Automação de login com Selenium

1. Com o projeto configurado e uma conta de teste ativa, rode o aplicativo no primeiro terminal.

   ```powershell
   npm.cmd run dev -- --port 5173 --strictPort
   ```

2. Abra outro terminal na raiz do repositório. Com Python 3.10 ou superior e Microsoft Edge disponíveis, prepare o ambiente e execute o script.

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r tests/e2e/requirements.txt
   .\.venv\Scripts\python.exe tests/e2e/login.py
   ```

3. Digite o e-mail e a senha da conta de teste quando o terminal solicitar. O script verifica se a seção **Banhos em andamento** aparece e salva a captura em `test-evidence/E2E-01-login.png`.

O **E2E-01 foi aprovado** com Selenium 4.52.0 no Microsoft Edge. Na tentativa inicial, a política de Controle de Aplicativo do Windows bloqueou o ChromeDriver com `WinError 4551`. O teste passou após trocar o navegador do script para o Edge, com a política do Windows ativa.
