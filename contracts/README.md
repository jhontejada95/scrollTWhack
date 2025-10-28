# TalentWell Smart Contract - Guía de Despliegue

## Despliegue en Remix IDE

### Paso 1: Abrir Remix
1. Ve a [https://remix.ethereum.org](https://remix.ethereum.org)
2. Crea un nuevo archivo: `TalentWellRegistry.sol`
3. Copia y pega el código del contrato

### Paso 2: Compilar
1. Ve a la pestaña "Solidity Compiler" (icono de S)
2. Selecciona versión del compilador: `0.8.20` o superior
3. Haz clic en "Compile TalentWellRegistry.sol"
4. Verifica que no haya errores

### Paso 3: Desplegar en Scroll Sepolia Testnet

#### Configurar MetaMask para Scroll Sepolia:
- **Network Name:** Scroll Sepolia Testnet
- **RPC URL:** `https://sepolia-rpc.scroll.io`
- **Chain ID:** `534351`
- **Currency Symbol:** ETH
- **Block Explorer:** `https://sepolia.scrollscan.com/`

#### Obtener ETH de prueba:
1. Ve a [Scroll Sepolia Faucet](https://sepolia.scroll.io/faucet)
2. Conecta tu wallet
3. Solicita ETH de prueba

#### Desplegar el contrato:
1. Ve a la pestaña "Deploy & Run Transactions" (icono de Ethereum)
2. En "Environment", selecciona **"Injected Provider - MetaMask"**
3. Asegúrate de estar conectado a Scroll Sepolia en MetaMask
4. Selecciona el contrato `TalentWellRegistry`
5. Haz clic en **"Deploy"**
6. Confirma la transacción en MetaMask
7. **Guarda la dirección del contrato desplegado**

### Paso 4: Obtener el ABI

Después de compilar, en la pestaña "Solidity Compiler":
1. Haz clic en "ABI" (botón de copiar al portapapeles)
2. Guarda el ABI en un archivo JSON

## Integración con la Aplicación

### 1. Crear archivo de configuración del contrato

Crea el archivo `src/lib/contract.ts` con:

```typescript
export const CONTRACT_ADDRESS = "TU_DIRECCION_DEL_CONTRATO_AQUI";

export const CONTRACT_ABI = [
  // Pega aquí el ABI completo copiado de Remix
];
```

### 2. Uso en el código

```typescript
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';

// Conectar al contrato
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Registrar un check-in
const checkInHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));
const tx = await contract.registerCheckIn(checkInHash, score);
await tx.wait();

// Verificar un check-in
const [exists, timestamp, score] = await contract.verifyCheckIn(checkInHash);

// Obtener estadísticas
const [avgScore, count] = await contract.getAggregatedStats(30);
```

## Funciones del Contrato

### `registerCheckIn(bytes32 _checkInHash, uint8 _score)`
Registra un nuevo check-in emocional
- **_checkInHash:** Hash SHA-256 del check-in anonimizado
- **_score:** Puntuación de 0 a 100

### `verifyCheckIn(bytes32 _checkInHash)`
Verifica si un check-in existe
- **Returns:** (exists, timestamp, score)

### `getTotalCheckIns()`
Retorna el total de check-ins registrados

### `getAggregatedStats(uint256 _count)`
Obtiene estadísticas agregadas de los últimos N registros
- **Returns:** (averageScore, recordCount)

### `getRecentCheckIns(uint256 _count)`
Obtiene los últimos N check-ins registrados
- **Returns:** (hashes[], timestamps[], scores[])

## Seguridad y Privacidad

✅ **Datos protegidos:** Solo se almacenan hashes, nunca datos personales
✅ **Verificable:** Cualquiera puede verificar la integridad de los registros
✅ **Inmutable:** Los registros no pueden ser alterados una vez escritos
✅ **Transparente:** Estadísticas agregadas disponibles públicamente

## Costos Estimados

- **Despliegue:** ~0.001 - 0.003 ETH
- **Registro de check-in:** ~0.0001 - 0.0003 ETH
- **Verificación (lectura):** Gratis

## Verificación del Contrato

Después del despliegue, verifica el contrato en Scrollscan:
1. Ve a [https://sepolia.scrollscan.com/](https://sepolia.scrollscan.com/)
2. Busca tu dirección de contrato
3. Ve a la pestaña "Contract"
4. Haz clic en "Verify and Publish"
5. Sigue los pasos de verificación

## Testnet vs Mainnet

**Para desarrollo (actual):**
- Red: Scroll Sepolia Testnet
- Chain ID: 534351
- ETH de prueba gratuito

**Para producción:**
- Red: Scroll Mainnet
- Chain ID: 534352
- Requiere ETH real
