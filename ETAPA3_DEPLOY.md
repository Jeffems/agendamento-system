# Etapa 3 — negócio, serviços e horários

## O que foi incluído

- perfil do negócio;
- catálogo de serviços com preço, duração, descrição e status;
- horários de funcionamento;
- preferências de lembrete;
- configuração inicial guiada;
- seleção de serviço cadastrado no formulário de agendamento;
- vínculo opcional entre serviço e agendamento;
- correção da rota de envio manual de lembrete por e-mail.

## Banco de dados

A migration `20260814193000_add_business_settings_and_services` adiciona campos
à tabela `usuarios`, cria `servicos` e adiciona `servicoId` aos agendamentos.
Ela não remove nem renomeia campos existentes.

Faça backup do PostgreSQL antes do deploy. No Railway, o comando de inicialização
deve continuar executando `prisma migrate deploy`.

## Publicação

1. Preserve os arquivos `.env` reais.
2. Substitua os arquivos do projeto.
3. No backend, execute `npm install`, `npm test` e `npm run build`.
4. No frontend, execute `npm install`, `npm test` e `npm run build`.
5. Envie ao GitHub e acompanhe primeiro o deploy da Railway e depois a Vercel.

## Teste depois do deploy

1. Abrir Configurações e salvar o perfil do negócio.
2. Definir os horários de funcionamento.
3. Cadastrar, editar e excluir um serviço sem agendamentos vinculados.
4. Criar um agendamento selecionando um serviço cadastrado.
5. Confirmar se duração e nome foram preenchidos automaticamente.
6. Criar outro agendamento preenchendo o serviço manualmente.
7. Enviar um lembrete manual por e-mail.
