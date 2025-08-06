# 🌿 CropSense Frontend

Interface do sistema CropSense — monitoramento inteligente de lavouras.

## 🚀 Como rodar o projeto

```bash
# Clone o repositório e acesse a pasta
cd crop-front

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
## Arquitetura do Projeto

- O backend será **serverless**.
- O próprio frontend será responsável pelas rotas autenticadas para o banco de dados no **Supabase**.
- Essa abordagem é melhor para desenvolvimento, pois mantém os mesmos dados e código para todos os ambientes.
