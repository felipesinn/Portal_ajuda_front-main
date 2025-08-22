# frontend/Dockerfile

FROM node:18-alpine

# Instalar dependências necessárias
RUN apk add --no-cache git

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S react -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Configurar npm para desenvolvimento
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Instalar dependências
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copiar código do projeto
COPY . .

# Ajustar permissões
RUN chown -R react:nodejs /app
USER react

# Expor porta do Vite
EXPOSE 3000

# Comando padrão (pode ser sobrescrito no docker-compose)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]