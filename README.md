# FamilyChef

Web app para organizar o cardapio semanal da familia e gamificar o preparo das refeicoes.

## Rodar localmente

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

## Build de producao

```bash
npm run build
npm run preview   # preview local do build
```

## Deploy no Vercel

1. Faca push do repositorio no GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositorio
3. O Vercel detecta Vite automaticamente — basta clicar **Deploy**
4. O `vercel.json` ja esta configurado para SPA redirect

Ou via CLI:

```bash
npm i -g vercel
vercel
```

## Adicionar a tela inicial

### iOS (Safari)
1. Abra o app no Safari
2. Toque no botao de compartilhar (quadrado com seta)
3. Role ate **Adicionar a Tela de Inicio**
4. Confirme o nome e toque em **Adicionar**

### Android (Chrome)
1. Abra o app no Chrome
2. Toque no menu (tres pontos) no canto superior direito
3. Toque em **Adicionar a tela inicial** (ou **Instalar app**)
4. Confirme e o app aparece como um aplicativo

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Zustand (estado global)
- react-apple-emojis
- HugeIcons (icones)
- PWA com Service Worker
