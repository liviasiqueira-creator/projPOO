# 💈 Barber Shop Management System

Sistema de gerenciamento para barbearias desenvolvido em TypeScript utilizando arquitetura monorepo com backend e frontend.

## 📌 Objetivo

O projeto tem como foco aplicar conceitos estudados durante o curso, como:

- APIs REST
- Programação Orientada a Objetos (POO)
- Arquitetura de software
- ORM
- Clean Architecture
- Controle de permissões

O sistema possui três perfis principais:

- Cliente
- Barbeiro
- Administrador da Barbearia

## 🚀 Funcionalidades

### Cliente

- Agendamento de serviços
- Compra de pacotes
- Histórico de atendimentos

### Barbeiro

- Gerenciamento de agenda
- Promoções e descontos
- Controle de serviços prestados

### Administrador

- Gerenciamento de barbeiros
- Controle financeiro
- Definição de taxas e permissões

## 🏗️ Estrutura do Projeto

```bash
root
 ├── backend
 └── frontend
```

## ⚙️ Tecnologias

### Backend

- Node.js
- TypeScript
- Express
- ORM
- Banco de dados relacional

### Frontend

- Vue.js
- TypeScript

## 🗄️ Banco de Dados

- 📊 [Diagrama de relacionamentos interativo](https://dbdocs.io/embed/8f2c02d55edb2a59e72578b881f2feda/d1a76939bd1f47118f6143c10b193e67)
- ✏️ [Editar schema no dbdiagram.io](https://dbdocs.io/arthurnazarethfalcao/DatabaseModelApplication/v/1?schema=public&view=table_structure) — senha: `projPOO`


## 🔐 Regras de Negócio

- Pacotes de serviços com preços personalizados
- Promoções e descontos
- Controle de permissões por perfil
- Retenção de taxas sobre serviços realizados

## 🚧 Status

Projeto em desenvolvimento.