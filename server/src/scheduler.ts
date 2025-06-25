import { KubeConfig, AppsV1Api, CoreV1Api, NetworkingV1Api } from '@kubernetes/client-node';

const BASE_DOMAIN = process.env.MCP_BASE_DOMAIN || 'example.com';
const NAMESPACE = process.env.MCP_NAMESPACE || 'mcp-lite';

const kc = new KubeConfig();
if (process.env.KUBECONFIG) {
  kc.loadFromFile(process.env.KUBECONFIG);
} else {
  kc.loadFromDefault();
}

const apps = kc.makeApiClient(AppsV1Api);
const core = kc.makeApiClient(CoreV1Api);
const net = kc.makeApiClient(NetworkingV1Api);

export async function deployMcp(id: string, image: string) {
  const name = `mcp-${id}`;
  // Deployment
  const deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name, namespace: NAMESPACE, labels: { mcp: id } },
    spec: {
      replicas: 1,
      selector: { matchLabels: { app: name } },
      template: {
        metadata: { labels: { app: name } },
        spec: {
          containers: [
            {
              name: 'runtime',
              image,
              ports: [{ containerPort: 8080 }],
              resources: { limits: { cpu: '250m', memory: '256Mi' } },
            },
          ],
        },
      },
    },
  } as any;
  // Service
  const service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: { name, namespace: NAMESPACE, labels: { mcp: id } },
    spec: {
      selector: { app: name },
      ports: [{ port: 80, targetPort: 8080 }],
    },
  } as any;
  // Ingress
  const ingress = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name,
      namespace: NAMESPACE,
      labels: { mcp: id },
      annotations: {
        'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
      },
    },
    spec: {
      rules: [
        {
          host: `${name}.${BASE_DOMAIN}`,
          http: { paths: [{ path: '/rpc', pathType: 'Prefix', backend: { service: { name, port: { number: 80 } } } }] },
        },
      ],
      tls: [{ hosts: [`${name}.${BASE_DOMAIN}`], secretName: `${name}-tls` }],
    },
  } as any;

  // Apply (create or replace) using object params required by client-node v1.x
  await apps.createNamespacedDeployment({ namespace: NAMESPACE, body: deployment })
    .catch(() => apps.replaceNamespacedDeployment({ name, namespace: NAMESPACE, body: deployment }));

  await core.createNamespacedService({ namespace: NAMESPACE, body: service })
    .catch(() => core.replaceNamespacedService({ name, namespace: NAMESPACE, body: service }));

  await net.createNamespacedIngress({ namespace: NAMESPACE, body: ingress })
    .catch(() => net.replaceNamespacedIngress({ name, namespace: NAMESPACE, body: ingress }));

  return `https://${name}.${BASE_DOMAIN}/rpc`;
}

export async function removeMcp(id: string) {
  const name = `mcp-${id}`;
  await apps.deleteNamespacedDeployment({ name, namespace: NAMESPACE }).catch(() => {});
  await core.deleteNamespacedService({ name, namespace: NAMESPACE }).catch(() => {});
  await net.deleteNamespacedIngress({ name, namespace: NAMESPACE }).catch(() => {});
} 