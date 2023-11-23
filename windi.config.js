import { defineConfig } from "windicss/helpers";

export default defineConfig({
  preflight: false,
  prefixer: false,
  extract: {
    // 忽略部分文件夹
    exclude: ["node_modules", ".git", "dist"],
  },
  corePlugins: {
    // 禁用掉在小程序环境中不可能用到的 plugins
    container: false,
  },
  theme: {
    borderRadius: {
      none: 0,
      sm: "5px",
      DEFAULT: "10px",
      lg: "15px",
      xl: "20px",
      full: "9999px",
    },
    extend: {
      fontSize: {
        10: "10px",
        11: "11px",
        12: "12px",
        13: "13px",
        14: "14px",
        15: "15px",
        16: "16px",
        17: "17px",
        18: "18px",
        19: "19px",
        20: "20px",
        24: "24px",
        30: "30px",
      },
      colors: {
        gray: {
          373: "#373A42",
          111: "#111",
          222: "#222",
          333: "#333",
          444: "#444",
          555: "#555",
          666: "#666",
          777: "#777",
          888: "#888",
          999: "#999",
          aaa: "#aaa",
          bbb: "#bbb",
          ccc: "#ccc",
          ddd: "#ddd",
          eee: "#eee",
          bg: "#F9F9F9",
        },
        blue: {
          DEFAULT: "#33ABF4",
        },
        red: {
          DEFAULT: "#FF545C",
          555: "#FF555D",
        },
        yellow: {
          DEFAULT: "#FF8F1F",
        },
        green: {
          DEFAULT: "#2ACB95",
        },
      },
      borderRadius: {
        l: "10px",
      },
    },
  },
});
