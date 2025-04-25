# Trampo Finder

O Trampo Finder é uma plataforma abrangente de mentoria de empregabilidade projetada para facilitar o acompanhamento do progresso de mentees em programas de mentoria. O sistema simplifica os processos de candidatura a vagas e fornece aos mentores recursos poderosos de geração de relatórios.

## Visão Geral

Desenvolvido para facilitar o acompanhamento do progresso de mentees em programas de mentoria de empregabilidade, o Trampo Finder oferece uma solução completa para busca de vagas, acompanhamento de candidaturas e gestão de mentorias. O sistema possui recursos robustos de gerenciamento de usuários, exibição de vagas, acompanhamento de status de candidaturas, upload de arquivos (exclusivo para mentores) e geração de relatórios em CSV (exclusivo para mentores).

## Principais Funcionalidades

- **Cadastro e Autenticação de Usuários**: Sistema de login seguro com controle de acesso baseado em funções (RBAC)
- **Listagem de Vagas**: Exibição abrangente de oportunidades de emprego disponíveis
- **Gerenciamento de Candidaturas**: Submissão e acompanhamento de candidaturas a vagas
- **Acompanhamento de Status**: Monitoramento do progresso das candidaturas com atualizações de status
- **Gerenciamento de Documentos**: Capacidade de upload de arquivos (apenas para mentores)
- **Sistema de Relatórios**: Geração de relatórios detalhados em CSV sobre candidaturas de mentees (apenas para mentores)
- **Recuperação de Senha**: Funcionalidade segura de redefinição de senha usando JWT e SMTP

## Arquitetura

A aplicação segue uma arquitetura modular com vários componentes principais:

### Módulos Principais
- **AppModule**: Módulo central da aplicação
- **IdentityModule**: Gerencia autenticação, usuários e autorização
- **JobManagementModule**: Administra listagens de vagas, candidaturas e favoritos
- **ReportManagementModule**: Gerencia a geração e administração de relatórios
- **PrismaModule**: Conexão com banco de dados e integração ORM
- **NotificationModule**: Gerencia notificações e alertas

### Implementação Técnica

- **Autenticação**: Implementada usando tokens JWT com permissões RBAC
- **Segurança de Senha**: Utiliza PBKDF2Sync para hash seguro de senhas
- **Comunicação**: Comunicação síncrona entre os módulos
- **Manipulação de Arquivos**: Implementada com Multer para upload de documentos
- **Relatórios**: ExcelJS para geração de relatórios abrangentes em CSV
- **Serviços de Email**: NodeMailer para recuperação de senha e notificações

## Tecnologias

- **Backend**: Node.js com framework NestJS
- **Banco de Dados**: PostgreSQL
- **Containerização**: Docker
- **Segurança**: JWT, PBKDF2Sync
- **Testes**: Jest
- **Processamento de Documentos**: Multer, ExcelJS
- **Email**: NodeMailer

## Configuração de Desenvolvimento

### 1. Instanciar o banco de dados
```bash
npm run docker:start
```

### 2. Rodar migrations
```bash
npm run db:generate
npm run db:push
```

### 3. Inicialização do projeto
```bash
npm run start
```

### 4. Rodar testes e2e/unit
```bash
npm run test:e2e
npm run test:unit
```

## Documentação Detalhada

Para visualizar documentação mais detalhada do código e arquitetura, use:

```bash
npx compodoc
```
