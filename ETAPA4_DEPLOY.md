# Etapa 4 — agenda pública

## Recursos incluídos

- link público personalizado por empresa;
- ativação e desativação da agenda pública;
- serviços, preços e duração na página pública;
- cálculo de horários disponíveis no backend;
- respeito aos horários de funcionamento;
- intervalo entre atendimentos;
- antecedência mínima e limite de dias futuros;
- criação ou reaproveitamento do cadastro do cliente;
- transação serializável para reduzir reservas simultâneas;
- confirmação visual do agendamento.

## Migration

A migration `20260814211500_add_public_booking` adiciona apenas campos novos em
`usuarios`, incluindo o endereço público único (`slug`). Nenhum dado existente
é removido.

## Ordem de publicação

1. Faça backup do PostgreSQL.
2. Preserve todos os `.env` reais.
3. Execute testes e build do backend e do frontend.
4. Publique primeiro o backend na Railway.
5. Confirme a aplicação das migrations das Etapas 3 e 4.
6. Publique o frontend na Vercel.
7. Em Configurações → Agenda pública, salve as regras e ative o link.

## Teste rápido

1. Cadastre ao menos um serviço ativo.
2. Configure os horários de funcionamento.
3. Defina um endereço como `studio-mariana` e ative a agenda pública.
4. Abra o link em janela anônima.
5. Escolha serviço, data e horário e conclua o agendamento.
6. Confirme que o agendamento e o cliente aparecem no painel interno.
7. Abra o link novamente e confirme que o horário reservado não está disponível.
8. Teste uma data fechada e uma reserva antes da antecedência mínima.

## Comandos

No backend e no frontend, execute separadamente:

```bash
npm install
npm test
npm run build
```
