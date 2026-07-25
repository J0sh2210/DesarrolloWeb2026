/**
 * HTTP Inspector CLI
 *
 * Tarea de la Sesión 1: Fundamentos de la Web
 *
 * Esta tarea NO usa la red, ni async/await, ni librerías externas.
 * Solo la biblioteca estándar de Node + tipos básicos de TypeScript.
 *
 * Idea: aplicar lo que aprendiste sobre HTTP (URLs, métodos, códigos
 * de estado y cabeceras) implementando pequeñas funciones puras.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Resultado de analizar una URL. */
export interface UrlParts {
  /** Protocolo tal como lo devuelve la WHATWG URL, p. ej. "https:". */
  protocol: string;
  /** Host (puede incluir puerto), p. ej. "api.ejemplo.com:443". */
  host: string;
  /** Ruta, p. ej. "/users". */
  pathname: string;
  /** Query string con el "?" inicial, p. ej. "?id=1&name=Ana". */
  search: string;
  /** Lista de pares [clave, valor] de los query params. */
  query: Array<[string, string]>;
}

/** Categoría de un código de estado HTTP. */
export type StatusCategory =
  | "1xx Informativo"
  | "2xx Éxito"
  | "3xx Redirección"
  | "4xx Error del cliente"
  | "5xx Error del servidor"
  | "Desconocido";

/** Mapa de cabeceras HTTP. */
export type Headers = Record<string, string>;

// ---------------------------------------------------------------------------
// Funciones a implementar
// ---------------------------------------------------------------------------

/**
 * Analiza una URL y devuelve sus partes compuestas.
 *
 * @param url - La cadena de texto de la URL a analizar.
 * @returns Objeto UrlParts con protocolo, host, pathname, search y query params.
 */
export function parseUrl(url: string): UrlParts {
  const u = new URL(url);

  return {
    protocol: u.protocol,
    host: u.host,
    pathname: u.pathname,
    search: u.search,
    query: Array.from(u.searchParams.entries()),
  };

}

/**
 * TODO: Clasifica un código de estado HTTP en su categoría.
 *
 * Reglas:
 *   100–199 → "1xx Informativo"
 *   200–299 → "2xx Éxito"
 *   300–399 → "3xx Redirección"
 *   400–499 → "4xx Error del cliente"
 *   500–599 → "5xx Error del servidor"
 *   otro    → "Desconocido"
 *
 * Pista: un único `if / else if` con comparaciones de rangos basta.
 */
/**
 * Clasifica un código de estado HTTP en su categoría correspondiente.
 *
 * @param code - Código de estado HTTP (ej. 200, 404).
 * @returns La categoría del estado en formato string.
 */
export function classifyStatus(code: number): StatusCategory {
  if (code >= 100 && code <= 199) return "1xx Informativo";
  if (code >= 200 && code <= 299) return "2xx Éxito";
  if (code >= 300 && code <= 399) return "3xx Redirección";
  if (code >= 400 && code <= 499) return "4xx Error del cliente";
  if (code >= 500 && code <= 599) return "5xx Error del servidor";
  
  return "Desconocido";
}
/**
 * Combina las funciones anteriores en un resumen legible de la petición.
 *
 * @param url - La URL solicitada.
 * @param status - El código de estado HTTP.
 * @param headersText - El texto de las cabeceras a parsear.
 * @returns Un string formateado con el resumen de la petición.
 */
export function summarizeRequest(
  url: string,
  status: number,
  headersText: string,
): string {
  const category = classifyStatus(status);
  const headers = parseHeaders(headersText);

  let summary = "Resumen de la petición\n";
  summary += "──────────────────────\n";
  summary += `URL:     ${url}\n`;
  summary += `Status:  ${status} (${category})\n`;
  summary += "Headers:\n";

  for (const key in headers) {
    summary += `  • ${key}: ${headers[key]}\n`;
  }

  return summary;
}

/**
 * Parsea un texto con líneas de cabeceras HTTP a un objeto Record<string, string>.
 * Ignora líneas vacías o sin formato válido.
 *
 * @param text - Texto bruto de las cabeceras.
 * @returns Objeto con los nombres de cabecera como clave y sus valores.
 */
export function parseHeaders(text: string): Headers {
  const result: Headers = {};
  
  // 1. Separamos el texto por saltos de línea
  const lines = text.split("\n");

  for (const line of lines) {
    // 2. Buscamos la posición del primer ":"
    const separatorIndex = line.indexOf(":");
    
    // 3. Ignoramos líneas que no tengan ":" (esto también filtra líneas vacías)
    if (separatorIndex === -1) {
      continue;
    }

    // 4. Extraemos nombre y valor, y recortamos los espacios sobrantes
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    // 5. Asignamos al objeto resultado
    result[key] = value;
  }

  return result;
}

const isMain = typeof require !== 'undefined' && require.main === module || process.argv[1]?.includes('index.ts');

if (isMain) {
  const [, , cmd, ...args] = process.argv;
  try {
    if (cmd === "parse-url" && args[0]) {
      const parts = parseUrl(args[0]);
      console.log(JSON.stringify(parts, null, 2));
    } else if (cmd === "status" && args[0]) {
      const cat = classifyStatus(Number(args[0]));
      console.log(cat);
    } else if (cmd === "headers" && args.length > 0) {
      const h = parseHeaders(args.join(" "));
      console.log(JSON.stringify(h, null, 2));
    } else if (cmd === "summary" && args.length >= 2) {
      const [url, status, ...rest] = args;
      console.log(summarizeRequest(url, Number(status), rest.join(" ")));
    } else {
      console.log("Uso:");
      console.log('  npm start parse-url "https://ejemplo.com/path?a=1"');
      console.log("  npm start status 404");
      console.log('  npm start headers "Content-Type: application/json"');
      console.log('  npm start summary "https://x.com" 200 "Content-Type: application/json"');
    }
  } catch (e) {
    console.error("Error:", (e as Error).message);
    process.exit(1);
  }
}


