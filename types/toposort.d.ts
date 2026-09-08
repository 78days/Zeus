declare module "toposort" {
  export default function toposort(edges: Array<[string, string]>): string[]
}
