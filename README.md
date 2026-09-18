# Link Plate

Quero criar uma aplicação web privada para meu próprio uso chamada "QR Manager".

OBJETIVO:

Gerenciar placas físicas que possuem QR Codes permanentes.

Cada placa possui um QR Code único e permanente. Esse QR Code nunca muda.

Cada placa pode ter um destino diferente e eu posso trocar o destino da placa pelo painel administrativo.

FLUXO:

No painel administrativo, cadastro uma PLACA.

O sistema gera um QR Code único para essa placa.

Eu imprimo esse QR Code e coloco em uma placa física.

No painel administrativo, cadastro DESTINOS com nome e URL.

Posso selecionar qual destino está atualmente associado a cada placa.

Quando alguém escanear o QR Code usando a câmera normal do celular, deve ser direcionado automaticamente para o destino atualmente associado àquela placa.

Quando eu estiver logado no painel administrativo, devo conseguir ler o QR Code de uma placa e, em vez de ir para o destino final, abrir a tela de configuração daquela placa para escolher seu destino.

ESTRUTURA MÍNIMA:

PLACAS:

ID

nome

identificador único

destino atual

DESTINOS:

ID

nome

URL

TELAS:

Login administrativo

Lista de placas

Criar placa

Visualizar QR Code da placa

Lista de destinos

Criar destino

Configurar destino de uma placa

Leitura de QR Code dentro do painel administrativo

PAINEL:

Mostrar cada placa com:

Nome

QR Code

Destino atual

Botão "Configurar"

Botão "Visualizar QR"

Botão "Ler QR"

DESTINOS:

Permitir criar, editar e excluir destinos.

Cada destino deve ter:

Nome

URL

LEITURA PÚBLICA:

Cada QR Code deve possuir uma URL pública única, por exemplo:

/q/ABC123

Quando alguém acessar essa URL sem estar autenticado no painel administrativo:

identificar a placa;

verificar seu destino atual;

redirecionar automaticamente para a URL do destino.

Se a placa não possuir destino configurado, mostrar uma mensagem simples:

"Esta placa ainda não possui um destino configurado."

LEITURA ADMINISTRATIVA:

Dentro do painel, criar um botão "Ler QR".

Ao escanear o QR de uma placa enquanto estiver autenticado:

identificar a placa;

NÃO redirecionar para o destino;

abrir a tela de configuração daquela placa;

mostrar o destino atual;

permitir escolher outro destino;

permitir criar um novo destino.

IMPORTANTE:

O mesmo QR Code deve continuar funcionando depois que o destino for alterado.

Não criar neste momento:

analytics;

dashboard de estatísticas;

pagamentos;

planos;

usuários adicionais;

equipes;

WhatsApp;

integrações;

fidelidade;

IA;

domínio personalizado.

Quero somente o MVP funcional.

A prioridade é:

CRIAR PLACA → GERAR QR → CRIAR DESTINO → ASSOCIAR DESTINO À PLACA → ESCANEAR COMO CLIENTE → REDIRECIONAR.

Depois:

LER QR PELO PAINEL → ALTERAR DESTINO → ESCANEAR O MESMO QR → REDIRECIONAR PARA O NOVO DESTINO.

Use uma arquitetura simples e preparada para posteriormente conectar Supabase e hospedar na Vercel.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bernieri-qr-point.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c6e22f1b-7c22-4c3e-9852-194151d820e5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
