# Especificações Técnicas do Módulo de Rastreamento (DevARO)

Este documento descreve a implementação técnica do rastreamento de localização em tempo real utilizado no CRM DevARO. Estas informações podem ser usadas para replicar a funcionalidade em outros aplicativos.

## 1. Frontend (Captura de Localização)

A captura é feita no lado do cliente (navegador) utilizando a **Geolocation API** nativa do HTML5.

### Implementação (React + TypeScript)

O rastreamento é iniciado automaticamente quando o usuário logado possui o papel de `SELLER` (Vendedor/Consultor).

**Código Core:**

```typescript
const watchIdRef = useRef<number | null>(null);

useEffect(() => {
  if (user?.role === 'SELLER') {
    if ('geolocation' in navigator) {
      // Inicia o monitoramento contínuo da posição
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Envia as coordenadas para o banco de dados
            await NeonService.updateSellerLocation(user.id, latitude, longitude);
          } catch (err) {
            console.error('Erro ao atualizar localização:', err);
          }
        },
        (error) => {
          console.warn('Erro GPS:', error.message);
        },
        // Configurações de precisão e frequência
        { 
          enableHighAccuracy: true, // Solicita a melhor precisão possível (GPS)
          maximumAge: 30000,        // Aceita posições em cache de até 30 segundos
          timeout: 27000            // Tempo limite para obter uma posição (27s)
        }
      );
    }
  }

  // Limpeza do listener ao desmontar o componente ou deslogar
  return () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  };
}, [user]);
```

### Parâmetros Críticos
*   `enableHighAccuracy: true`: Força o dispositivo a usar o hardware de GPS se disponível, consumindo mais bateria mas garantindo precisão.
*   `maximumAge: 30000`: Evita leituras excessivas aceitando dados recentes do cache.
*   `timeout: 27000`: Garante que a aplicação não fique travada esperando uma leitura se o sinal estiver fraco.

## 2. Backend / Banco de Dados (PostgreSQL via Neon Serverless)

Os dados são persistidos em uma tabela PostgreSQL.

### Schema da Tabela `sellers`

```sql
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... outros campos (nome, email, etc)
  lat DOUBLE PRECISION,           -- Latitude
  lng DOUBLE PRECISION,           -- Longitude
  last_seen TIMESTAMP WITH TIME ZONE, -- Data/Hora da última atualização
  -- ...
);
```

### Query de Atualização

A atualização é feita através de uma query SQL direta que atualiza as coordenadas e o timestamp `last_seen`.

```sql
UPDATE sellers 
SET lat = $1, lng = $2, last_seen = CURRENT_TIMESTAMP 
WHERE id = $3 
RETURNING *
```

*   **$1**: Latitude (float/double)
*   **$2**: Longitude (float/double)
*   **$3**: ID do Vendedor (UUID)

## 3. Prompt Sugerido para IA

Se você deseja pedir para uma IA implementar isso em outro app, utilize o seguinte prompt:

> "Implemente um sistema de rastreamento de localização em tempo real para usuários com perfil de 'Vendedor'.
>
> **Requisitos do Frontend:**
> 1. Use `navigator.geolocation.watchPosition` dentro de um `useEffect`.
> 2. Configure `enableHighAccuracy: true` para precisão de GPS.
> 3. Defina `maximumAge` como 30s e `timeout` como 27s para otimizar bateria e performance.
> 4. Garanta que o `watchId` seja limpo (`clearWatch`) no cleanup do efeito.
> 5. A cada atualização de posição, chame uma função assíncrona para persistir os dados.
>
> **Requisitos do Backend (SQL):**
> 1. Adicione colunas `lat` (Double), `lng` (Double) e `last_seen` (Timestamp) na tabela de usuários/vendedores.
> 2. Crie uma função/query que receba ID, Latitude e Longitude e atualize esses campos, setando `last_seen` para o momento atual."
