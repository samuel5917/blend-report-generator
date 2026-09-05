# Blend Report Generator

CRIE UM SITE WEB — GERADOR DE JUSTIFICATIVA DO BLEND

Quero criar um site web simples, rápido, profissional e muito fácil de usar para gerar automaticamente Movimentações do Turno e Justificativa do Blend.

O objetivo principal é substituir a digitação manual das justificativas de turno por um formulário inteligente com opções, seleções e campos condicionais.

1. REGRA PRINCIPAL

O sistema NÃO deve depender de IA para montar a justificativa principal.

Toda a geração do texto deve ser feita por regras determinísticas no próprio código.

O usuário preenche os dados através de campos, seleções e botões, e o sistema monta automaticamente o texto final.

A aplicação deve funcionar de forma independente, podendo ser hospedada no GitHub Pages, Vercel, Netlify ou outro serviço estático.

NÃO criar dependência obrigatória de:

Lovable;

Supabase;

OpenAI;

Gemini;

qualquer API externa.

Se futuramente houver IA, ela deve ser apenas um recurso adicional de revisão, nunca uma dependência para gerar a justificativa.

2. OBJETIVO DA INTERFACE

O operador deve conseguir gerar uma justificativa completa em poucos cliques.

Fluxo ideal:

Selecionar data.

Selecionar turno.

Selecionar os bancos/frentes utilizados.

Para cada banco, informar a situação da Planta 01.

Para cada banco, informar a situação da Planta 02.

O sistema mostra campos adicionais somente quando necessários.

Adicionar observações do turno.

Registrar paradas operacionais.

Registrar outras movimentações.

Registrar reprocesso.

Registrar produto destinado ao estoque.

Registrar remanejo.

Clicar em "GERAR JUSTIFICATIVA".

O sistema apresenta o texto final já formatado.

Permitir copiar o texto completo com um botão.

3. CABEÇALHO

Criar:

MOVIMENTAÇÕES DO TURNO E JUSTIFICATIVA DO BLEND

Campos:

Data

Turno

Turnos disponíveis:

1°

2°

Gerar automaticamente:

Turno: 2°
Data: 24/08

4. BANCOS / FRENTES

A aplicação precisa permitir selecionar quais bancos participaram do turno.

Criar uma lista configurável inicialmente com:

B-1060

B-1060 MN

B-1030

B-1030 Final do Banco

B-1030 Meio do Banco

B-1030 334

B-1030 353

B-1120

B-1070

B-1020

Pilha B-1020

B-1020 SF

Baia 01

Baia 01 1110

Baia 02

Baia 02 1110

Baia 03

Pulmão 01

outros bancos personalizados

O usuário deve poder adicionar outro banco manualmente caso necessário.

Não obrigar todos os bancos a aparecerem na justificativa.

Somente os bancos selecionados devem ser incluídos.

5. CONFIGURAÇÃO DE CADA BANCO

Para cada banco selecionado, criar um card.

Exemplo:

B-1060

PLANTA 01

Pergunta:

Qual foi a situação da Planta 01?

Opções:

Atendido

Não houve movimentação

Atendido parcialmente

Outra situação

PLANTA 02

Pergunta:

Qual foi a situação da Planta 02?

Opções:

Atendido

Atendido parcialmente

Não atendido

Não houve movimentação

Substituído por outro material

Outra situação

6. PLANTA 01

Criar opções prontas para evitar digitação.

Quando o usuário selecionar:

"Não houve movimentação"

Mostrar:

Motivo

Opções:

Planta 01 não operou

Planta parada

Pulmão cheio

Orientação operacional para manter o pulmão sem alimentação

Montagem da nova estrutura

Atividades de aterro

Nova praça operacional em preparação

Outro

Se escolher "Outro", abrir campo de texto.

Exemplos reais encontrados nos relatórios:

"Não houve movimentação para o pulmão da planta 01 em razão da não operação da Planta 01."

"Não houve movimentação em virtude da planta inoperante."

"Planta permanece parada para montagem da nova estrutura."

O sistema deve montar automaticamente a frase de acordo com a opção selecionada.

7. PLANTA 02 — BLEND ATENDIDO

Se selecionar:

Blend atendido

Mostrar opções complementares:

Conforme planejado no Blend proposto pela Qualidade

Conforme a Diretriz Operacional

Reiniciado de maneira proporcional

Blend atendido e reiniciado

Blend atendido mais de uma vez

Foram adicionadas novas viagens

Outra observação

Também permitir informar:

Aderência (%)

Campo numérico opcional.

Número de viagens realizadas

Campo numérico opcional.

Número de viagens programadas

Campo numérico opcional.

Se o usuário informar aderência, gerar por exemplo:

"B-1060: Operado com aderência de 150%."

ou:

"B-1060: 20 viagens realizadas, com aderência de 100%."

8. BLEND PARCIALMENTE ATENDIDO

Se selecionar:

Atendido parcialmente

Abrir:

Viagens programadas

Viagens realizadas

Aderência

Motivo

Motivos pré-programados:

Pulmão cheio

Falta de material

Aguardando geração de material

Material com elevada umidade

Falta de frente seca

Baixa disponibilidade de CBs

Baixa disponibilidade de motoristas

Manutenção de equipamento

Parada da planta

Material insuficiente na frente

Material finalizado

Condição operacional

Orientação da Qualidade

Redistribuição das viagens entre outros bancos

Outro

Permitir selecionar mais de um motivo.

Exemplo real:

"Blend atendido parcialmente para o pulmão da planta 02 em razão de pulmão cheio causado pela não operação da Planta 02 por manutenção preventiva."

9. BLEND NÃO ATENDIDO

Se selecionar:

Não atendido

Mostrar:

Motivo

Opções:

Pulmão cheio

Falta de material

Aguardando geração de material

Material com umidade elevada

Falta de frente seca

Rompedor em manutenção

Equipamento em manutenção

Baixa disponibilidade de CBs

Baixa disponibilidade de motoristas

Parada da Planta 02

Orientação da Qualidade

Material finalizado

Falta de condição operacional

Outro

Mostrar também:

Viagens programadas

Viagens realizadas

Aderência %

10. SUBSTITUIÇÃO DE MATERIAL

Criar uma opção específica:

Viagens substituídas por outro material/banco

Ao selecionar, mostrar:

Banco originalmente previsto

Banco/material utilizado

Quantidade de viagens

Motivo

Orientação de quem autorizou

Exemplo:

"As viagens faltantes da frente foram substituídas por material proveniente do B-1060, garantindo a continuidade e proporcionalidade das movimentações."

Esse tipo de situação aparece nos relatórios e precisa ser tratado como uma situação normal do sistema.

11. OBSERVAÇÃO INDIVIDUAL DO BANCO

Cada banco deve ter:

+ Adicionar observação

Campo livre opcional.

Exemplos:

material com elevada umidade;

necessidade de geração de material;

falta de material desmontado;

material finalizado;

necessidade de atuação do rompedor;

acompanhamento da frente;

condição da praça de carregamento.

12. OUTRAS OBSERVAÇÕES DO TURNO

Criar uma seção:

OUTRAS OBSERVAÇÕES

Permitir adicionar várias observações.

Botão:

+ Adicionar observação

Cada observação pode ser digitada livremente.

Também criar sugestões rápidas:

Blend atendido conforme Diretriz.

Blend reiniciado de maneira proporcional.

Blend foi reformulado.

Blend foi realizado mais de uma vez.

Houve redistribuição de viagens.

Houve baixa disponibilidade de CBs.

Houve baixa disponibilidade de motoristas.

Houve necessidade de geração de material.

Houve material com elevada umidade.

Houve movimentação de sínter.

Houve movimentação para estoque.

Houve reprocesso.

Houve atividade de aterro.

Houve remanejo.

Outro.

As sugestões devem ser inseridas no campo ao clicar, mas o usuário deve poder editar.

13. PARADAS OPERACIONAIS

Criar uma seção dinâmica:

PARADAS OPERACIONAIS

Botão:

+ Adicionar parada

Cada parada deve possuir:

Local

Opções:

Pulmão Planta 01

Pulmão Planta 02

B-1060

B-1030

B-1120

Planta 01

Planta 02

Mina

Acesso

Outro

Início

Campo de horário.

Fim

Campo de horário.

Motivo

Opções:

Pulmão cheio

Aguardando gerar material

Falta de material

Falta de rompedor

Equipamento em manutenção

Planta sem operação

Planta parada

Acerto da praça de carregamento

Carreta interditando acesso

Bloqueio de acesso

Baixa visibilidade

Neblina

Falta de energia

Sobrecarga de equipamento

Troca de turno / DDS

Aguardando orientação

Necessidade interna

Manutenção preventiva

Outro

Campo opcional:

Observação da parada

Gerar:

"Pulmão Planta 02: 12:29 às 15:15 — Aguardando gerar material no B-1030."

14. OUTRAS MOVIMENTAÇÕES

Criar:

OUTRAS MOVIMENTAÇÕES

Categorias:

OM

Opções:

Não houve OM

Houve OM

Se houver:

Quantidade de viagens

Origem

Destino

Descrição

Observação

Exemplo:

"OM: 2 viagens do B-1040 para a portaria (realização de leira)."

15. REPROCESSO

Criar:

REPROCESSO

Opções:

Não houve movimentação

Houve reprocesso

Se houver:

Quantidade

Material

Origem

Destino

Observação

Exemplo:

"2 viagens de reprocesso de Sínter da Planta 01 para a Planta 02."

16. PRODUTO PARA ESTOQUE

Criar:

PRODUTO PARA ESTOQUE

Opções:

Não houve movimentação

Houve movimentação

Campos:

Material

Origem

Destino

Quantidade de viagens

Pilha/Baia

Observação

Orientação/alinhamento, opcional

Exemplo:

"27 viagens de sínter da Planta 02 para a Planta 01 — Pilha B."

17. REMANEJO

Criar:

REMANEJO

Opções:

Não houve remanejo

Houve remanejo

Campos:

Quantidade

Origem

Destino

Material

Observação

Exemplo:

"12 viagens da Baia 01 1110 para o Pulmão da Planta 02."

18. GERADOR DE TEXTO

Criar botão grande:

GERAR JUSTIFICATIVA

Ao clicar, gerar automaticamente:

MOVIMENTAÇÕES DO TURNO E JUSTIFICATIVA DO BLEND

Turno: 2°
Data: 24/08

Bancos

B-1060:

Planta 01: ...

Planta 02: ...

B-1120:

Planta 01: ...

Planta 02: ...

Outras observações:

...

Paradas operacionais:

...

Outras movimentações:

OM

...

Reprocesso

...

Produto para estoque

...

Remanejo

...

19. FORMATAÇÃO

O texto final deve:

manter português correto;

manter nomenclatura operacional;

respeitar maiúsculas e minúsculas;

usar "Planta 01" e "Planta 02";

usar "Pulmão Planta 01" e "Pulmão Planta 02";

usar "Blend";

usar "Diretriz";

usar "Qualidade";

usar "CBs";

usar "viagens";

usar os nomes exatos dos bancos cadastrados.

Não inventar informações.

Se o usuário não informar determinada informação, não criar uma informação falsa para preencher o texto.

20. EDITOR FINAL

Depois de gerar a justificativa, mostrar uma área de texto editável.

O usuário deve poder alterar qualquer parte antes de copiar.

Botões:

COPIAR JUSTIFICATIVA

EDITAR

LIMPAR

NOVA JUSTIFICATIVA

21. SALVAR NO NAVEGADOR

Adicionar opção:

Salvar rascunho

Usar LocalStorage do navegador.

Não exigir banco de dados.

Permitir:

salvar justificativa;

continuar depois;

duplicar justificativa anterior;

excluir justificativa.

Criar uma página/seção:

Histórico

Mostrar:

Data

Turno

Status

Data de criação

Ao clicar, abrir a justificativa novamente.

22. INTERFACE

A interface deve ser moderna, limpa e profissional.

Priorizar:

poucos cliques;

campos grandes;

botões claros;

cards;

seções recolhíveis;

boa visualização em desktop;

responsividade para celular;

carregamento rápido.

Não criar uma interface excessivamente complexa.

O usuário deve conseguir preencher um turno rapidamente.

23. SISTEMA DE CAMPOS CONDICIONAIS

Isso é MUITO importante.

Não mostrar todos os campos de uma vez.

Exemplo:

Se:

"Planta 02 → Blend atendido"

mostrar apenas opções relacionadas ao atendimento.

Se:

"Planta 02 → Não atendido"

mostrar os motivos de não atendimento.

Se:

"Produto para estoque → Não houve"

não mostrar campos de origem/destino.

Se:

"Produto para estoque → Houve"

mostrar os campos necessários.

O formulário deve se adaptar conforme as escolhas.

24. DADOS DEVEM SER CONFIGURÁVEIS

Criar uma estrutura de configuração no código para que futuramente seja fácil adicionar:

novos bancos;

novos motivos;

novos tipos de movimentação;

novas frases;

novas opções;

novos tipos de parada.

Não espalhar essas informações de forma desorganizada pelo código.

Criar, por exemplo, arquivos/objetos de configuração separados.

25. IMPORTANTE — NÃO ALTERAR O SENTIDO OPERACIONAL

O sistema não deve "embelezar" ou inventar justificativas.

Ele deve transformar as informações selecionadas pelo operador em texto profissional, mantendo exatamente o sentido operacional informado.

Exemplo:

Usuário seleciona:

Banco: B-1120
Planta 02: Não atendido
Motivo: Material com elevada umidade
Viagens realizadas: 15
Aderência: 22%

O sistema pode gerar:

"B-1120: 15 viagens realizadas, com aderência de 22%. A programação não foi concluída em razão da elevada umidade do material."

26. BASE REAL DOS DADOS

Use como referência estrutural o PDF fornecido pelo usuário:

"Movimentacoes_e_Blend_Agosto_01_a_24_08_2026.pdf"

Os relatórios mostram padrões como:

Blend atendido;

Blend atendido parcialmente;

Blend não atendido;

aderência percentual;

Blend reiniciado;

movimentações proporcionais;

pulmão cheio;

falta/geração de material;

material com elevada umidade;

falta de frente seca;

baixa disponibilidade de CBs;

baixa disponibilidade de motoristas;

manutenção;

parada de planta;

reprocesso;

estoque;

remanejo;

OM;

substituição de viagens;

movimentações entre bancos;

movimentações entre plantas;

paradas com horário inicial e final.

Esses padrões devem orientar a estrutura do sistema, mas o sistema nunca deve preencher informações que o operador não forneceu.

27. ARQUITETURA

Preferência:

React + TypeScript;

Vite;

CSS/Tailwind;

LocalStorage;

componentes reutilizáveis;

código limpo;

sem backend obrigatório.

O projeto deve poder ser baixado do GitHub e executado independentemente da plataforma que criou o projeto.

Não utilizar recursos proprietários que impeçam a portabilidade.

28. RESULTADO ESPERADO

Quero um sistema funcional, não apenas um protótipo visual.

Ao terminar, eu quero conseguir abrir o site, selecionar:

Data → Turno → Banco → Planta → Situação → Motivo → Observações → Paradas → Movimentações

e clicar em:

GERAR JUSTIFICATIVA

para receber imediatamente uma justificativa completa e editável no padrão utilizado nos relatórios de operação.

Antes de finalizar, teste todos os fluxos principais e garanta que não existam erros de geração do texto, campos que desaparecem incorretamente, dados perdidos ou opções que não funcionam.

Prioridade:

Funcionamento

Geração correta do texto

Facilidade de uso

Portabilidade

Visual profissional

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/55f765f6-76e8-45f1-8fdd-d6d144694c2b).

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
