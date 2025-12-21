FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./

RUN npm install

# Copy the rest of the project
COPY . .

# Expose ports: Vite dev server and preview server
EXPOSE 5173 4173

# Default command: run dev server
CMD ["npm", "run", "dev"]