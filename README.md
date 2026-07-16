# Locação de Carros

Sistema de check-in/check-out de locação de veículos, com fotos, assinatura digital
e histórico salvo no Supabase.

O banco de dados e o armazenamento de fotos **já estão criados e configurados**
no projeto Supabase `locadora-carros`. Você só precisa publicar o site.

---

## Passo 1 — Colocar o código no GitHub

1. Acesse https://github.com e clique em **New repository**.
2. Dê um nome, por exemplo `locadora-carros`, deixe como **Private** (privado) e clique em **Create repository**.
3. Na página do repositório vazio, clique no link **"uploading an existing file"**.
4. Arraste TODOS os arquivos e pastas deste projeto para a área de upload
   (inclusive a pasta `src`, o `package.json`, `index.html`, `vite.config.js`,
   `.gitignore` e `.env.example`).
   - **Não** precisa subir o arquivo `.env` (ele nem deve existir ainda — as
     chaves reais serão configuradas direto na Vercel no próximo passo).
5. Clique em **Commit changes**.

## Passo 2 — Publicar na Vercel

1. Acesse https://vercel.com e faça login (dá para usar a própria conta do GitHub).
2. Clique em **Add New… → Project**.
3. Escolha o repositório `locadora-carros` que você acabou de criar.
4. A Vercel vai detectar automaticamente que é um projeto **Vite** — não precisa mudar nada
   nas configurações de build.
5. Antes de clicar em Deploy, abra a seção **Environment Variables** e adicione estas duas
   (os valores estão no arquivo `.env.example` deste projeto):

   | Nome | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://vtlavilysssmjrsldcbc.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | (copie o valor grande que está no `.env.example`) |

6. Clique em **Deploy**. Em cerca de 1 minuto seu site estará no ar, com um link tipo
   `https://locadora-carros.vercel.app`.

Pronto — esse link já é o sistema funcionando, salvando tudo no Supabase. Pode abrir
no celular, tirar fotos e assinar normalmente.

---

## Importante sobre segurança

Para simplificar (sem exigir login), o app hoje é de **acesso livre para quem tiver o
link**: qualquer pessoa com a URL do site consegue ver e cadastrar locações, incluindo
fotos de CPF, RG e CNH. Isso é aceitável para uso interno com o link não divulgado
publicamente, mas **não é recomendado se o link for ficar público** ou se vários
funcionários externos forem acessar.

Se no futuro quiser adicionar um login (usuário e senha) para proteger o sistema, é
possível usar a autenticação pronta do Supabase — é só pedir que eu adiciono depois.

## Se algo der errado

- Tela em branco na Vercel → confira se as duas variáveis de ambiente foram realmente
  salvas em **Project Settings → Environment Variables** e clique em **Redeploy**.
- Erro ao salvar fotos/dados → confira sua internet; os dados ficam no Supabase, então
  o site precisa de conexão para funcionar (não funciona totalmente offline).
