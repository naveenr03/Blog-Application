// vite.config.ts
import { defineConfig } from "file:///C:/Users/n10r/Downloads/blog/blog/blog-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/n10r/Downloads/blog/blog/blog-frontend/node_modules/@vitejs/plugin-react/dist/index.js";
var uiVersion = process.env.npm_package_version ?? "dev";
var vite_config_default = defineConfig({
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(uiVersion)
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          editor: ["@tiptap/react", "@tiptap/starter-kit"],
          ui: ["@nextui-org/react"]
        }
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuMTByXFxcXERvd25sb2Fkc1xcXFxibG9nXFxcXGJsb2dcXFxcYmxvZy1mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbjEwclxcXFxEb3dubG9hZHNcXFxcYmxvZ1xcXFxibG9nXFxcXGJsb2ctZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL24xMHIvRG93bmxvYWRzL2Jsb2cvYmxvZy9ibG9nLWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5cclxuLy8gU2V0IGJ5IG5wbS95YXJuL3BucG0gd2hlbiBydW5uaW5nIHBhY2thZ2UuanNvbiBzY3JpcHRzIChlLmcuIG5wbSBydW4gZGV2IC8gYnVpbGQpXHJcbmNvbnN0IHVpVmVyc2lvbiA9IHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX3ZlcnNpb24gPz8gJ2RldidcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgZGVmaW5lOiB7XHJcbiAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfQVBQX1ZFUlNJT04nOiBKU09OLnN0cmluZ2lmeSh1aVZlcnNpb24pLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gIGJ1aWxkOiB7XHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXHJcbiAgICAgICAgICBlZGl0b3I6IFsnQHRpcHRhcC9yZWFjdCcsICdAdGlwdGFwL3N0YXJ0ZXIta2l0J10sXHJcbiAgICAgICAgICB1aTogWydAbmV4dHVpLW9yZy9yZWFjdCddXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlUsU0FBUyxvQkFBb0I7QUFDMVcsT0FBTyxXQUFXO0FBR2xCLElBQU0sWUFBWSxRQUFRLElBQUksdUJBQXVCO0FBR3JELElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLG9DQUFvQyxLQUFLLFVBQVUsU0FBUztBQUFBLEVBQzlEO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUNqRCxRQUFRLENBQUMsaUJBQWlCLHFCQUFxQjtBQUFBLFVBQy9DLElBQUksQ0FBQyxtQkFBbUI7QUFBQSxRQUMxQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
