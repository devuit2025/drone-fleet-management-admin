# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            // Other configs...

            // Remove tseslint.configs.recommended and replace with this
            tseslint.configs.recommendedTypeChecked,
            // Alternatively, use this for stricter rules
            tseslint.configs.strictTypeChecked,
            // Optionally, add this for stylistic rules
            tseslint.configs.stylisticTypeChecked,

            // Other configs...
        ],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            // Other configs...
            // Enable lint rules for React
            reactX.configs['recommended-typescript'],
            // Enable lint rules for React DOM
            reactDom.configs.recommended,
        ],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
]);
```

**Core Libraries:**
- **`mapbox-gl`** (^3.16.0) - Engine render bản đồ 2D/3D với hiệu năng cao
  - Style customization
  - Real-time marker updates
  - Layer management
  
- **`@mapbox/mapbox-gl-draw`** (^1.5.1) - Công cụ vẽ trên map
  - Vẽ polygon (no-fly zones, flight permits)
  - Line drawing (mission routes)
  - Point markers (waypoints)

**Utilities:**
- **`@turf/turf`** (^7.2.0) - Phân tích geospatial
  - Tính khoảng cách giữa các điểm
  - Point-in-polygon detection
  - Area calculations
  - Geometry transformations

### WebSocket & Real-time Communication

**Core:**
- **`socket.io-client`** (^4.8.1) - WebSocket client với tính năng:
  - Auto-reconnection
  - Message queuing khi disconnect
  - Multiple subscriptions per channel
  - Namespace support (`/drone`)
  - Event-based architecture

**Implementation:**
- Provider: `src/providers/WebSocketProvider.tsx`
- Real-time events:
  - `telemetry` - Dữ liệu vị trí, pin, tốc độ từ drone
  - `status-changed` - Cập nhật trạng thái drone
  - `mission-update` - Tiến độ nhiệm vụ
  - `video-stream` - H.264 video frames

### State Management

**Real-time Data:**
- **`zustand`** (^5.0.8) - Global state cho drone telemetry
  - `useActiveDroneStore` - Store vị trí real-time của drones
  - Lightweight, không cần provider wrapper
  - TypeScript-first

**Server State:**
- **`@tanstack/react-query`** (^5.90.5) - Quản lý API calls
  - Auto caching & invalidation
  - Background refetch
  - Optimistic updates
  - Used for CRUD operations (missions, drones, permits)

### Visualization

**Charts & Metrics:**
- **`chart.js`** (^4.5.1) + **`react-chartjs-2`** (^5.3.1)
  - Battery level history
  - Altitude/speed charts
  - Mission progress graphs
