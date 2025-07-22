# Documentação do Template Angular + Electron Multi-Janelas

Este documento detalha a estrutura e as configurações essenciais do template Angular com Electron, focado no gerenciamento de múltiplas janelas.

## Estrutura de Pastas

- **src/**: Contém todo o código-fonte do aplicativo Angular (frontend), incluindo componentes, serviços, rotas, etc. Para a documentação deste template, focaremos apenas nos arquivos que interagem diretamente com o Electron ou que são cruciais para a configuração do build.
- **app/**: Contém os arquivos do processo principal (backend) do Electron, como `main.ts`, `preload.ts` e o `multiWindowService.ts`. Estes arquivos são fundamentais para o funcionamento do aplicativo desktop.
- **assets/** (ou `dist/assets/icons`): Esta pasta é utilizada exclusivamente pelo electron-builder para armazenar os ícones e imagens de splash do aplicativo.
  - `icon.ico`: Ícone para Windows.
  - `icon.icns`: Ícone para macOS.
  - `icon.png`: Ícone para Linux.
  - `electron.bmp`: Imagem de splash para a versão portátil (Windows).

> **Importante:** As imagens e outros recursos visuais usados pelo Angular (frontend) devem ser colocados na pasta `public/` (conforme configurado no `angular.json`), pois essa pasta é copiada para o build do Angular.

---

## Arquivos de Configuração

### tsconfig.json

Define as configurações TypeScript para o Angular (frontend). É a configuração padrão do Angular com algumas opções importantes:

- `experimentalDecorators: true`: Permite o uso de decorators (necessário para Angular).
- `target: "ES2022"` e `module: "ES2022"`: Utiliza recursos modernos do JavaScript.
- `strict: true`: Ativa verificações rigorosas de tipos (recomendado para qualidade do código).
- `moduleResolution: "bundler"`: Otimizado para bundlers modernos como Webpack/Vite.

> **Nota:** Este arquivo afeta apenas a compilação do Angular. Para configurações do Electron (`main.ts`/`preload.ts`), consulte o `tsconfig.serve.json`.

---

### tsconfig.app.json

Estende o `tsconfig.json` e define configurações específicas para a aplicação Angular (frontend). Ele especifica:

- **Arquivos principais do Angular:** `"src/main.ts"`, `"src/main.server.ts"`, `"src/server.ts"`.
- **Tipos do Node incluídos:** Permite usar APIs do Node.js no código do Angular (útil para SSR, mas não afeta o Electron diretamente).
- **Diretório de saída:** `"outDir": "./out-tsc/app"`.

> **Nota:** Este arquivo afeta apenas a compilação do Angular. Para o Electron, consulte o `tsconfig.serve.json`.

---

### tsconfig.serve.json

Define as opções de compilação TypeScript para os arquivos do Electron (`main.ts` e `preload.ts`). Ele garante que esses arquivos sejam compilados corretamente para rodar no Node.js/Electron, usando módulos CommonJS e incluindo os tipos do Node.js.

> **Importante:** Se você adicionar novos arquivos TypeScript para o processo principal ou preload, inclua-os aqui para garantir que sejam compilados.

---

### angular.json

Define as configurações de build, serve e test do Angular.

**Principais pontos relevantes para o template:**

- `outputPath: "dist"`: O build do Angular é gerado na pasta `dist/` (e depois copiado para o Electron).
- `index: "src/index.html"`: O arquivo principal HTML do Angular.
- `tsConfig: "tsconfig.app.json"`: Usa o arquivo de configuração TypeScript do aplicativo.
- `assets`: Copia tudo da pasta `public/` para o build final.
- `styles: ["src/styles.scss"]`: Usa SCSS como linguagem de estilos padrão.
- `configurations`: Define diferentes modos de build:
  - `production`: Build otimizado para produção.
  - `web` e `web-production`: Builds específicos para rodar apenas no navegador (sem Electron).
  - `development`: Build para desenvolvimento.
- `serve`: Permite rodar o Angular em diferentes modos (dev, prod, web).
- **SSR (Server Side Rendering):** O template já está preparado para SSR, mas isso é opcional para uso com Electron.

> **Nota:** O build do Angular (pasta `dist/`) é o que será empacotado junto com o Electron para formar o aplicativo desktop.

---

### package.json

Define a estrutura do projeto Angular + Electron, incluindo metadados, scripts e dependências.

**Scripts principais:**

- `npm start`: Desenvolvimento: Roda o Angular (em `localhost:4200`) e o Electron em paralelo.
- `npm run build:prod`: Realiza o build de produção do Angular.
- `npm run electron:build`: Cria o executável final para distribuição.
- `npm run electron:local`: Testa o build localmente.

**Dependências importantes:**

- **Angular 19.2**: Framework frontend.
- **Electron 36.4**: Framework desktop.
- **electron-builder**: Ferramenta para criar executáveis para Windows, macOS e Linux.
- **npm-run-all** e **wait-on**: Utilitários para orquestrar o processo de desenvolvimento.

**Configurações importantes:**

- `"main": "app/main.js"`: Define o arquivo principal do Electron.
- `"private": true`: Evita a publicação acidental do pacote no npm.

> **Nota:** O arquivo `package.json` não permite comentários. Toda a documentação sobre scripts, dependências e configurações deve ser feita no `README.md` ou em arquivos de documentação separados.

---

### electron-builder.json

Configura como o aplicativo é empacotado para distribuição.

**Estrutura de arquivos no build:**

- **Angular build** (`dist/browser/`) → vai para `resources/` (raiz do aplicativo).
- **Arquivos Electron** (`app/`) → vão para `resources/app/app/`.
- **Exclui** código-fonte, TypeScript, configurações e arquivos desnecessários.

**Configurações importantes:**

- `"asar": false`: Os arquivos ficam descompactados (facilita o debug). Para um pouco mais de segurança e ofuscação, você pode mudar para `true`.
- `"output": "release"`: Os executáveis são gerados na pasta `release/`.
- **Protocolo customizado:** Permite abrir o aplicativo via URL, como `gerenciador-testes://`.

**Targets por plataforma:**

- **Windows:** Instalador NSIS com opções de customização.
- **macOS:** Arquivo DMG.
- **Linux:** AppImage.

**Ícones:**

- Todos os ícones devem estar em `dist/assets/icons/`.
- Windows: `.ico`, macOS: `.icns`, Linux: `.png`.

---

## Arquivos Essenciais do Electron

### app/preload.ts

Expõe uma API segura (`window.electronAPI`) para comunicação entre o Angular (processo de renderização) e o Electron (processo principal) usando IPC (Inter-Process Communication).

- `send(channel, data)`: Envia mensagens do renderer para o main process (sem esperar resposta).
- `on(channel, callback)`: Escuta eventos enviados do main process para o renderer.
- `invoke(channel, ...args)`: Envia mensagens do renderer para o main process e espera uma resposta (Promise).

> **Nota:** Essas funções cobrem praticamente todos os casos de uso de IPC em aplicativos Electron modernos. Se precisar de mais funções (ex: remover listeners específicos, enviar mensagens apenas para um canal, etc.), você pode adicioná-las conforme a necessidade.

---

### app/main.ts

É o ponto de entrada do processo principal do Electron.

- **Detecta o modo de execução:** Desenvolvimento (`--serve`) ou produção.
- **Desenvolvimento:** Carrega o Angular do servidor local (`localhost:4200`).
- **Produção:** Carrega o Angular do arquivo HTML buildado.
- **Usa o `MultiWindowBrowserService`** para gerenciar janelas de forma organizada.
- **Configurações de segurança:** `contextIsolation: true` e `nodeIntegration: false`.

**Eventos importantes:**

- `ready`: Cria a janela principal quando o Electron está pronto.
- `window-all-closed`: Fecha o aplicativo quando todas as janelas são fechadas (exceto no macOS).
- `activate`: (Opcional) Recria janelas no macOS quando o aplicativo é ativado.

---

### app/services/multiWindowService.ts

Implementa um serviço singleton para gerenciar múltiplas janelas do Electron de forma organizada através de grupos.

**Principais funcionalidades:**

- Grupos de janelas: Organiza janelas em grupos com limites configuráveis.
- Controle de limite: Define o número máximo de janelas permitido por grupo.
- FIFO automático: Opção de fechar a primeira janela quando o limite é atingido (`forcefirstClose`).
- Nomes únicos: Garante que os nomes das janelas sejam únicos globalmente.
- Múltiplos tipos de conteúdo: Suporta URL, arquivo local ou HTML direto.
- Configurações avançadas: DevTools, timeout, menus customizados.

**Métodos principais:**

- `createGroup()`: Cria um novo grupo de janelas.
- `createWindow()`: Cria uma janela dentro de um grupo específico.
- `getWindowByName()`: Busca uma janela por nome globalmente.
- `getWindowByIndex()`: Busca uma janela por índice dentro de um grupo.

**Exemplo de uso:**

```typescript
const windowService = MultiWindowBrowserService.getInstance();
windowService.createGroup('main', 1, true);
windowService.createWindow('main', 'main1', {
  width: 800,
  height: 600,
  type: 'url',
  url: 'http://localhost:4200'
});
Nota: Este serviço é o coração do template, permitindo gerenciar múltiplas janelas de forma profissional e organizada.
