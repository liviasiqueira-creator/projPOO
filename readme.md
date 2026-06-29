# Barber Shop Management System

Sistema de gerenciamento para barbearias desenvolvido em TypeScript, com backend e frontend em monorepo.

## Objetivo

Projeto desenvolvido para a disciplina de Programação Orientada a Objetos (POO), aplicando:

- APIs REST
- Programação Orientada a Objetos (POO)
- Clean Architecture
- Value Objects e Entidades de domínio
- Autenticação com JWT
- Controle de permissões por perfil

O sistema possui dois perfis principais:

- **Cliente** — agenda serviços e acompanha seus atendimentos
- **Dono de barbearia** — gerencia a barbearia, serviços, agenda e promoções

## Funcionalidades implementadas

### Cliente

- Login com autenticação JWT
- Explorar barbearias cadastradas (com busca por nome)
- Visualizar perfil da barbearia (serviços, horários, endereço)
- Agendar horário — seleção de serviço ou promoção, data e horário disponível
- Visualizar agendamentos futuros e histórico

### Dono de barbearia

- Login com autenticação JWT
- Cadastrar nova barbearia
- Gerenciar informações da barbearia (nome, telefone, endereço, horário de funcionamento)
- Gerenciar catálogo de serviços (criar, editar, remover)
- Gerenciar agenda — visualização por data com calendário
- Criar e gerenciar promoções baseadas em fidelidade (ex: "3 agendamentos = 1 corte grátis")

## Estrutura do projeto

```
root
 ├── backend
 │    └── src
 │         ├── domain          # Entidades e Value Objects (User, Email, Money, Phone, Slug)
 │         ├── application     # Casos de uso (Login) e ports
 │         ├── infrastructure  # Implementações (BCrypt, JWT, repositório em memória)
 │         └── http            # Servidor Express e rotas
 └── frontend
      └── src
           ├── pages           # Telas (Login, Home, Schedule, Dashboard, etc.)
           ├── components      # Componentes reutilizáveis (Sidebar, Cards, Forms)
           └── services        # Camada de comunicação com a API (Axios + JWT interceptor)
```

## Tecnologias

### Backend

- Node.js + TypeScript
- Express
- Clean Architecture (Domain / Application / Infrastructure / HTTP)
- JWT (autenticação)
- BCrypt (hash de senhas)
- Repositório em memória (sem banco de dados por enquanto)

### Frontend

- Vue.js 3 (Composition API)
- TypeScript
- Vuetify (componentes Material Design)
- Vue Router
- Axios

## Banco de Dados

- [Diagrama de relacionamentos interativo](https://dbdocs.io/embed/8f2c02d55edb2a59e72578b881f2feda/d1a76939bd1f47118f6143c10b193e67)
- [Editar schema no dbdiagram.io](https://dbdocs.io/arthurnazarethfalcao/DatabaseModelApplication/v/1?schema=public&view=table_structure) — senha: `projPOO`

## Regras de Negócio

- Promoções de fidelidade baseadas em quantidade de agendamentos
- Recompensa automática ao atingir a meta (ex: serviço gratuito)
- Controle de permissões por perfil (dono vs. cliente)
- Disponibilidade de horários calculada com base no horário de funcionamento e duração do serviço

## Como rodar

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend conecta na API via `VITE_API_URL` (padrão: `http://localhost:3000`).

## Status

Frontend concluído. Backend com autenticação implementada — integração das demais rotas em andamento.
