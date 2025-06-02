# Concepção: 

## Fluxo Principal: 

- O usuário entra na aplicação, provê todas as informações que ele pode sobre o seu perfil: interesses, atividades que realiza no dia-a-dia, tarefas que ele geralmente têm, requisições em seu trabalho, além de claro informações sobre atuação e profissão. 

- A IA faz um pré fine-tuning das informações para gerar sugestões de conversas / chats que são voltados para as atividades que ele tem que realizar no dia-a-dia. Cada chat, em seu fine-tuning / pipeline individual, possui especificidades voltadas para uma atividade. 

- A IA usa a forma de processamento bruto na LLM local, e para requisições mais específicas, tools (MCPs), e armazenamento de RAG, a nuvem (Datastax para RAG, AWS para armazenamento, Instâncias / Serviços da AWS para respostas refinadas). No início (primeiro MVP), eu quero que os endpoints de especificidade sejam feitos pelo Langflow, para que eu consiga rodar coisas mais específicas, mas mesmo assim rodando com a capacidade de processamento do cliente. 

