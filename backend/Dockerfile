# Usa a imagem oficial do Node.js v22 baseada em Alpine Linux como ponto de partida
FROM node:22-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de manifesto de dependências (package.json e package-lock.json)
COPY package*.json ./

# Instala as dependências de produção do projeto
RUN npm install --only=production

# Copia o resto do código da sua aplicação (server.js, etc.) para o contêiner
COPY . .

# Expõe a porta 3000, informando ao Docker que a aplicação
# escutará nesta porta dentro do contêiner.
EXPOSE 3000

# O comando que será executado quando o contêiner iniciar
CMD ["node", "server.js"]