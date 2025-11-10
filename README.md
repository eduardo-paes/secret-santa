# Secret Santa App

## Descrição

O **Secret Santa App** é uma aplicação simples e intuitiva para organizar sorteios de amigo oculto. Com ele, você pode adicionar participantes, realizar o sorteio e compartilhar os resultados de forma prática e segura.

## Funcionalidades

- Adicionar participantes ao sorteio.
- Realizar sorteios garantindo que ninguém tire a si mesmo.
- Gerar links individuais para cada participante visualizar seu resultado.
- Interface moderna e responsiva.

## Tecnologias Utilizadas

- **React**: Biblioteca para construção da interface do usuário.
- **Supabase**: Backend para armazenamento dos resultados do sorteio.
- **Vite**: Ferramenta de build para desenvolvimento rápido.
- **TypeScript**: Tipagem estática para maior segurança no desenvolvimento.
- **CSS Global**: Estilização com a fonte moderna "Inter".

## Como Executar o Projeto

### Pré-requisitos

- Node.js instalado.
- Conta no [Supabase](https://supabase.com/).

### Passos

1. Clone este repositório:

   ```bash
   git clone https://github.com/seu-usuario/secret-santa.git
   ```

2. Acesse o diretório do projeto:

   ```bash
   cd secret-santa
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Configure as variáveis de ambiente:

   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_KEY=your-supabase-key
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse o app no navegador:

   ```bash
   http://localhost:5173
   ```

## Estrutura do Projeto

- `src/index.tsx`: Lógica principal do app.
- `src/global.css`: Estilos globais do app.
- `netlify/functions/draw.js`: Função serverless para lidar com sorteios.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e enviar pull requests.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.