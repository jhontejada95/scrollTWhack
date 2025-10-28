# TalentWell - Plataforma de Bienestar Emocional con Blockchain

URL_DEMO: https://talentwell-stress-bu-y4wx.bolt.host/

TalentWell es una aplicación web que permite a las empresas monitorear el bienestar emocional de sus empleados de forma segura, anónima y verificable mediante tecnología blockchain. Los registros de check-ins emocionales se almacenan tanto en base de datos como en blockchain (Scroll Sepolia), garantizando transparencia e inmutabilidad.

## Tabla de Contenidos

- [Funcionalidades Principales](#funcionalidades-principales)
- [Funcionalidades Secundarias](#funcionalidades-secundarias)
- [Flujo del Usuario](#flujo-del-usuario)
- [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
- [Contrato Inteligente](#contrato-inteligente)
- [Integraciones](#integraciones)
- [Instalación y Configuración](#instalación-y-configuración)
- [Stack Tecnológico](#stack-tecnológico)

---

## Funcionalidades Principales

### 1. Check-in Emocional Diario
Los empleados pueden registrar su estado emocional una vez al día seleccionando entre cinco estados:
- **Excelente** (100 puntos)
- **Bien** (75 puntos)
- **Normal** (50 puntos)
- **Estresado** (40 puntos)
- **Agotado** (20 puntos)

Cada check-in incluye:
- Selección de estado emocional
- Comentario opcional (máximo 200 caracteres)
- Registro automático con timestamp
- Hash anónimo generado para blockchain
- Registro en smart contract de Scroll Sepolia

### 2. Verificación Blockchain
Cada check-in se registra en blockchain para garantizar:
- **Inmutabilidad**: Los registros no pueden ser alterados
- **Transparencia**: Cualquiera puede verificar la existencia del registro
- **Anonimato**: Solo se almacena un hash SHA-256, nunca datos personales
- **Trazabilidad**: Enlace directo a la transacción en Scrollscan

### 3. Dashboard de Analytics
Los gerentes tienen acceso a un dashboard con:
- Promedio de bienestar del equipo en tiempo real
- Tendencia histórica de los últimos 30 días
- Total de check-ins registrados
- Gráficos visuales de evolución emocional
- Filtros por período de tiempo

### 4. Sistema de Autenticación Segura
- Registro con email y contraseña
- Activación mediante código único de empresa
- Roles diferenciados (Empleado / Gerente)
- Sesiones persistentes con Supabase Auth
- Protección mediante Row Level Security (RLS)

---

## Funcionalidades Secundarias

### 1. Gestión de Códigos de Activación
- Códigos únicos por empresa
- Validación automática al registrarse
- Prevención de reutilización
- 18 códigos pre-generados para demo

### 2. Navegación Intuitiva
- Diseño responsive (móvil, tablet, desktop)
- Transiciones suaves entre vistas
- Estados de carga y feedback visual
- Mensajes de error descriptivos

### 3. Conexión Web3
- Integración con MetaMask
- Configuración automática de Scroll Sepolia
- Solicitud automática de cambio de red
- Manejo de errores de conexión

### 4. Prevención de Duplicados
- Un check-in por usuario por día
- Validación en base de datos (unique constraint)
- Mensaje informativo si ya existe registro

---

## Flujo del Usuario

### Flujo Completo: Desde Registro hasta Check-in Verificado

#### Fase 1: Registro y Activación

1. **Acceso a la Aplicación**
   - El usuario visita la aplicación TalentWell
   - Se presenta con opciones de "Iniciar sesión" o "Registrarse"

2. **Registro de Cuenta**
   - El usuario selecciona "Registrarse"
   - Completa el formulario con:
     - Email corporativo
     - Contraseña segura
     - Código de activación de la empresa
   - El sistema valida que el código existe y no ha sido usado

3. **Activación de Cuenta**
   - El código se marca como usado
   - Se crea el usuario en Supabase Auth
   - Se vincula al usuario con su empresa
   - Se asigna el rol correspondiente (empleado o gerente)
   - El usuario es redirigido automáticamente al dashboard

#### Fase 2: Check-in Emocional

4. **Primer Check-in del Día**
   - El usuario navega a la sección "Check-in"
   - Se presenta con cinco opciones emocionales visuales
   - Selecciona el estado que mejor describe su día
   - Opcionalmente, agrega un comentario (máximo 200 caracteres)

5. **Procesamiento del Check-in**
   - El sistema genera un hash SHA-256 anónimo del registro
   - Guarda el check-in en la base de datos Supabase
   - Automáticamente inicia conexión con MetaMask
   - Si no está en Scroll Sepolia, solicita cambio de red

6. **Registro en Blockchain**
   - El usuario confirma la transacción en MetaMask
   - El smart contract registra el hash y score
   - Se genera un transaction hash único
   - El transaction hash se guarda en la base de datos

#### Fase 3: Verificación

7. **Visualización del Check-in**
   - Se muestra mensaje de éxito
   - Aparece panel de "Verificación Blockchain" con:
     - Hash registrado (primeros 20 caracteres)
     - Timestamp del registro
     - Red blockchain (Scroll Sepolia)
     - Enlace al contrato inteligente
     - Enlace a la transacción específica

8. **Verificación On-Chain**
   - El usuario puede hacer clic en "Verificar en Blockchain"
   - El sistema consulta el smart contract directamente
   - Confirma que el hash existe en blockchain
   - Muestra datos verificados: score y timestamp

9. **Explorador de Bloques**
   - El usuario puede hacer clic en "Ver transacción"
   - Se abre Scrollscan en una nueva pestaña
   - Puede ver todos los detalles de la transacción:
     - Block number
     - Gas usado
     - Hash de la transacción
     - Estado de confirmación

#### Fase 4: Analytics (Solo Gerentes)

10. **Acceso al Dashboard**
    - Los gerentes navegan a "Analytics"
    - Visualizan datos agregados y anónimos de todo el equipo

11. **Análisis de Tendencias**
    - Revisan el promedio de bienestar actual
    - Observan la tendencia de los últimos 30 días
    - Identifican patrones y áreas de mejora
    - Exportan datos para reportes ejecutivos

#### Ciclo Diario

12. **Restricción de Un Check-in por Día**
    - Si el usuario intenta hacer otro check-in el mismo día
    - Se muestra mensaje: "Ya has realizado tu check-in de hoy"
    - Puede ver su check-in existente con verificación blockchain
    - Debe esperar hasta el día siguiente para nuevo registro

13. **Check-in del Día Siguiente**
    - A las 00:00 del nuevo día, el usuario puede registrar nuevo check-in
    - El ciclo se repite desde el paso 4

---

## Arquitectura de Base de Datos

TalentWell utiliza **Supabase** (PostgreSQL) con Row Level Security (RLS) habilitada en todas las tablas.

### Esquema de Tablas

#### 1. `companies` - Tabla de Empresas

Almacena información de las organizaciones que usan TalentWell.

```sql
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id`: Identificador único de la empresa (UUID)
- `name`: Nombre de la empresa
- `sector`: Sector o industria de la empresa
- `created_at`: Fecha de creación del registro

**Políticas RLS:**
- Los usuarios solo pueden ver la empresa a la que pertenecen
- Validación mediante join con tabla `users`

---

#### 2. `users` - Tabla de Usuarios

Almacena información de empleados y gerentes vinculados a empresas.

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager')),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id`: Referencia al usuario de Supabase Auth
- `email`: Email corporativo único
- `role`: Rol del usuario (`employee` o `manager`)
- `company_id`: Referencia a la empresa
- `created_at`: Fecha de registro

**Políticas RLS:**
- Los usuarios pueden ver y actualizar su propio perfil
- Solo pueden crear su propio registro durante el signup
- Los gerentes pueden ver empleados de su empresa

**Índices:**
```sql
CREATE INDEX idx_users_company ON users(company_id);
```

---

#### 3. `activation_codes` - Códigos de Activación

Códigos únicos para vincular usuarios a empresas durante el registro.

```sql
CREATE TABLE activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  used boolean DEFAULT false,
  used_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id`: Identificador único
- `code`: Código de activación (ej: "DEMO2025")
- `company_id`: Empresa asociada al código
- `used`: Indica si el código ya fue usado
- `used_by`: Usuario que usó el código
- `created_at`: Fecha de creación

**Políticas RLS:**
- Los usuarios pueden ver códigos no usados o usados por ellos
- Pueden actualizar códigos durante el proceso de activación
- Prevención de reutilización mediante CHECK constraint

**Índices:**
```sql
CREATE INDEX idx_activation_codes_code ON activation_codes(code);
```

**Códigos Pre-generados:**
```
DEMO2025, TALENT01, WELLNESS99, WELLBEING2025, MINDFUL24,
HEALTH2025, BALANCE360, THRIVE2025, WELLNESS360, TALENT2025,
CARE2025, VITALITY24, EMPOWER2025, FLOURISH24, MINDSET2025,
ZENWORK2025, HAPPY2025, GROWTH2025
```

---

#### 4. `check_ins` - Registros de Check-ins Emocionales

Tabla principal que almacena todos los check-ins de bienestar emocional.

```sql
CREATE TABLE check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  emotion text NOT NULL CHECK (emotion IN ('great', 'good', 'okay', 'stressed', 'exhausted')),
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  comment text DEFAULT '',
  blockchain_hash text DEFAULT '',
  blockchain_tx_hash text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  date date DEFAULT CURRENT_DATE,
  UNIQUE(user_id, date)
);
```

**Campos:**
- `id`: Identificador único del check-in
- `user_id`: Usuario que realizó el check-in
- `company_id`: Empresa del usuario
- `emotion`: Estado emocional (`great`, `good`, `okay`, `stressed`, `exhausted`)
- `score`: Puntuación numérica (20-100)
- `comment`: Comentario opcional del usuario
- `blockchain_hash`: Hash SHA-256 anónimo para blockchain
- `blockchain_tx_hash`: Hash de la transacción en Scroll Sepolia
- `created_at`: Timestamp del registro
- `date`: Fecha del check-in (para constraint de único por día)

**Constraint Importante:**
```sql
UNIQUE(user_id, date)
```
Garantiza que cada usuario solo pueda hacer un check-in por día.

**Políticas RLS:**
- Los usuarios pueden ver solo sus propios check-ins
- Los gerentes pueden ver check-ins de toda su empresa (datos agregados)
- Los usuarios solo pueden crear check-ins para sí mismos
- Validación de pertenencia a la empresa

**Índices:**
```sql
CREATE INDEX idx_check_ins_user ON check_ins(user_id);
CREATE INDEX idx_check_ins_company ON check_ins(company_id);
CREATE INDEX idx_check_ins_date ON check_ins(date);
```

---

### Relaciones entre Tablas

```
┌─────────────┐
│  companies  │
└──────┬──────┘
       │
       │ 1:N
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────┐      ┌────────────────┐
│  users   │      │ activation_codes│
└────┬─────┘      └────────────────┘
     │
     │ 1:N
     │
     ▼
┌────────────┐
│ check_ins  │
└────────────┘
```

---

### Mapeo de Emociones a Scores

| Emoción     | Valor Enum   | Score |
|-------------|--------------|-------|
| Excelente   | `great`      | 100   |
| Bien        | `good`       | 75    |
| Normal      | `okay`       | 50    |
| Estresado   | `stressed`   | 40    |
| Agotado     | `exhausted`  | 20    |

---

### Migraciones Aplicadas

#### 1. `20251028020026_create_talentwell_schema.sql`
- Creación de todas las tablas
- Configuración de RLS
- Políticas de seguridad
- Índices para optimización
- Datos de demostración

#### 2. `20251028022804_add_blockchain_tx_hash.sql`
- Adición de columna `blockchain_tx_hash` a tabla `check_ins`
- Permite almacenar hash de transacción de Scroll Sepolia

---

## Contrato Inteligente

### Información General

- **Nombre**: TalentWellRegistry
- **Red**: Scroll Sepolia Testnet
- **Dirección**: `0x2B439F8B6F9afB05c7E9008Cc72EFa1C929d2bC2`
- **Chain ID**: 534351
- **Lenguaje**: Solidity ^0.8.20
- **Licencia**: MIT

### Propósito

El contrato inteligente `TalentWellRegistry` registra check-ins emocionales de forma anónima e inmutable en blockchain. Solo almacena hashes SHA-256 y scores, nunca datos personales identificables.

### Estructura de Datos

#### CheckInRecord

```solidity
struct CheckInRecord {
    bytes32 checkInHash;    // Hash SHA-256 del check-in
    uint256 timestamp;      // Timestamp del bloque
    uint8 score;            // Puntuación 0-100
    bool exists;            // Flag de existencia
}
```

### Funciones Principales

#### 1. `registerCheckIn`

Registra un nuevo check-in emocional en blockchain.

```solidity
function registerCheckIn(
    bytes32 _checkInHash,
    uint8 _score
) external
```

**Parámetros:**
- `_checkInHash`: Hash SHA-256 del check-in (32 bytes)
- `_score`: Puntuación emocional (0-100)

**Validaciones:**
- Score debe ser <= 100
- Hash no debe existir previamente

**Emite:**
```solidity
event CheckInRegistered(
    bytes32 indexed recordHash,
    uint256 timestamp,
    uint8 score
);
```

**Ejemplo de Uso:**
```typescript
const hash = ethers.keccak256(ethers.toUtf8Bytes(dataString));
const tx = await contract.registerCheckIn(hash, 75);
await tx.wait();
```

---

#### 2. `verifyCheckIn`

Verifica si un check-in existe en el registro blockchain.

```solidity
function verifyCheckIn(bytes32 _checkInHash)
    external
    view
    returns (
        bool exists,
        uint256 timestamp,
        uint8 score
    )
```

**Parámetros:**
- `_checkInHash`: Hash a verificar

**Retorna:**
- `exists`: true si el check-in existe
- `timestamp`: Momento del registro
- `score`: Puntuación registrada

**Ejemplo de Uso:**
```typescript
const [exists, timestamp, score] = await contract.verifyCheckIn(hash);
if (exists) {
    console.log(`Score: ${score}, Fecha: ${new Date(timestamp * 1000)}`);
}
```

---

#### 3. `getTotalCheckIns`

Obtiene el total de check-ins registrados en el contrato.

```solidity
function getTotalCheckIns() external view returns (uint256)
```

**Retorna:**
- Total de check-ins registrados

---

#### 4. `getAggregatedStats`

Obtiene estadísticas agregadas de los últimos N registros.

```solidity
function getAggregatedStats(uint256 _count)
    external
    view
    returns (
        uint256 averageScore,
        uint256 recordCount
    )
```

**Parámetros:**
- `_count`: Cantidad de registros a analizar

**Retorna:**
- `averageScore`: Promedio de scores
- `recordCount`: Cantidad de registros analizados

**Ejemplo de Uso:**
```typescript
const [avgScore, count] = await contract.getAggregatedStats(30);
console.log(`Promedio últimos 30 registros: ${avgScore}/100`);
```

---

#### 5. `getRecentCheckIns`

Obtiene los últimos N check-ins registrados.

```solidity
function getRecentCheckIns(uint256 _count)
    external
    view
    returns (
        bytes32[] memory hashes,
        uint256[] memory timestamps,
        uint8[] memory scores
    )
```

**Parámetros:**
- `_count`: Cantidad de registros a retornar

**Retorna:**
- `hashes`: Array de hashes de check-ins
- `timestamps`: Array de timestamps
- `scores`: Array de puntuaciones

---

#### 6. `getRecordByIndex`

Obtiene un registro específico por su índice en el array.

```solidity
function getRecordByIndex(uint256 _index)
    external
    view
    returns (
        bytes32 checkInHash,
        uint256 timestamp,
        uint8 score
    )
```

---

### Eventos

#### CheckInRegistered

```solidity
event CheckInRegistered(
    bytes32 indexed recordHash,
    uint256 timestamp,
    uint8 score
);
```

Emitido cuando se registra un nuevo check-in.

#### CheckInVerified

```solidity
event CheckInVerified(
    bytes32 indexed recordHash,
    bool isValid
);
```

Emitido cuando se verifica un check-in (funcionalidad futura).

---

### Variables de Estado

- `owner`: Dirección del propietario del contrato
- `totalCheckIns`: Contador total de check-ins registrados
- `records`: Mapping de hash a CheckInRecord
- `recordHashes`: Array de todos los hashes registrados

---

### Seguridad y Privacidad

#### Protecciones Implementadas

1. **Anonimato Total**
   - Solo se almacenan hashes SHA-256
   - Imposible revertir hash a datos originales
   - No se almacenan IDs de usuario, emails, o datos personales

2. **Prevención de Duplicados**
   - Validación de hash no existente
   - Revert si se intenta registrar el mismo hash dos veces

3. **Validación de Datos**
   - Score debe estar en rango 0-100
   - Timestamps automáticos del bloque

4. **Inmutabilidad**
   - Los registros no pueden ser modificados una vez escritos
   - Transparencia total mediante eventos

5. **Ownership**
   - Función `transferOwnership` para cambio de propietario
   - Modificador `onlyOwner` para funciones administrativas

---

## Despliegue del Contrato

### Guía Paso a Paso

#### Preparación

1. **Instalar MetaMask**
   - Descargar extensión de [metamask.io](https://metamask.io)
   - Crear o importar wallet

2. **Configurar Scroll Sepolia**
   - Network Name: `Scroll Sepolia Testnet`
   - RPC URL: `https://sepolia-rpc.scroll.io`
   - Chain ID: `534351`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.scrollscan.com/`

3. **Obtener ETH de Testnet**
   - Visitar [Scroll Sepolia Faucet](https://sepolia.scroll.io/faucet)
   - Conectar wallet
   - Solicitar ETH de prueba (gratis)

---

#### Despliegue en Remix IDE

1. **Abrir Remix**
   - Ir a [remix.ethereum.org](https://remix.ethereum.org)

2. **Crear Archivo**
   - Click en "Create New File"
   - Nombre: `TalentWellRegistry.sol`
   - Copiar código desde `contracts/TalentWellRegistry.sol`

3. **Compilar Contrato**
   - Ir a pestaña "Solidity Compiler" (icono S)
   - Seleccionar compiler: `0.8.20` o superior
   - Click en "Compile TalentWellRegistry.sol"
   - Verificar que no haya errores

4. **Desplegar**
   - Ir a pestaña "Deploy & Run Transactions"
   - Environment: **"Injected Provider - MetaMask"**
   - Confirmar que MetaMask está en Scroll Sepolia
   - Seleccionar contrato: `TalentWellRegistry`
   - Click en **"Deploy"**
   - Confirmar transacción en MetaMask
   - **Guardar dirección del contrato desplegado**

5. **Copiar ABI**
   - En pestaña "Solidity Compiler"
   - Click en botón "ABI" (copiar al portapapeles)
   - El ABI ya está incluido en `src/lib/contract.ts`

---

#### Configuración en la Aplicación

1. **Actualizar Dirección del Contrato**

Editar `src/lib/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = "TU_DIRECCION_AQUI";
```

Reemplazar con la dirección obtenida en Remix.

2. **Verificar ABI**

El ABI ya está pre-configurado en el mismo archivo. No es necesario modificarlo.

---

#### Verificación del Contrato (Opcional)

Para mayor transparencia, verificar el código en Scrollscan:

1. Ir a [sepolia.scrollscan.com](https://sepolia.scrollscan.com/)
2. Buscar tu dirección de contrato
3. Click en pestaña "Contract"
4. Click en "Verify and Publish"
5. Completar formulario:
   - Compiler: `0.8.20`
   - Optimization: `No`
   - License: `MIT`
6. Pegar código del contrato
7. Click en "Verify and Publish"

Una vez verificado, el código será público y auditable.

---

#### Costos Estimados

| Operación          | Costo Aproximado (ETH) |
|--------------------|------------------------|
| Despliegue         | 0.001 - 0.003          |
| registerCheckIn    | 0.0001 - 0.0003        |
| verifyCheckIn      | Gratis (lectura)       |
| getAggregatedStats | Gratis (lectura)       |

**Nota**: En testnet, el ETH es gratuito. En mainnet, usa ETH real.

---

#### Mainnet vs Testnet

**Desarrollo/Testing (Actual):**
- Red: Scroll Sepolia Testnet
- Chain ID: 534351
- ETH: Gratuito desde faucet
- Explorador: https://sepolia.scrollscan.com/

**Producción (Futuro):**
- Red: Scroll Mainnet
- Chain ID: 534352
- ETH: Real, requiere compra
- Explorador: https://scrollscan.com/

---

## Integraciones

### 1. Supabase

**Propósito**: Base de datos PostgreSQL con autenticación y Row Level Security.

#### Configuración

Variables de entorno en `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Servicios Utilizados

**Supabase Auth:**
- Registro de usuarios con email/password
- Inicio de sesión
- Gestión de sesiones
- Verificación de tokens JWT

**Supabase Database:**
- PostgreSQL con RLS habilitado
- Tablas: companies, users, activation_codes, check_ins
- Políticas de seguridad granulares
- Índices para optimización

**Row Level Security (RLS):**
```sql
-- Ejemplo: Los usuarios solo ven sus propios check-ins
CREATE POLICY "Users can view their own check-ins"
  ON check_ins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

#### Cliente Supabase

Archivo: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

### 2. Ethers.js

**Propósito**: Librería para interacción con Ethereum y redes compatibles (Scroll).

#### Configuración

Instalación:
```bash
npm install ethers@^6.15.0
```

#### Funcionalidades

**Conexión a Wallet:**
```typescript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
```

**Interacción con Contrato:**
```typescript
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);

const tx = await contract.registerCheckIn(hash, score);
await tx.wait();
```

**Generación de Hash:**
```typescript
const hash = ethers.keccak256(ethers.toUtf8Bytes(dataString));
```

---

### 3. MetaMask

**Propósito**: Wallet de navegador para firmar transacciones blockchain.

#### Requisitos

- MetaMask instalado en el navegador
- Configurado para Scroll Sepolia Testnet
- ETH de testnet en la wallet

#### Configuración Automática

La aplicación detecta y configura automáticamente:

```typescript
// Cambio automático de red
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x8274F' }], // 534351 en hex
});

// Si la red no existe, la agrega
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x8274F',
    chainName: 'Scroll Sepolia Testnet',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia-rpc.scroll.io'],
    blockExplorerUrls: ['https://sepolia.scrollscan.com/'],
  }],
});
```

---

### 4. Scroll Sepolia Testnet

**Propósito**: Red blockchain Layer 2 de Ethereum para registros inmutables.

#### Información de Red

- **RPC URL**: https://sepolia-rpc.scroll.io
- **Chain ID**: 534351
- **Explorer**: https://sepolia.scrollscan.com/
- **Faucet**: https://sepolia.scroll.io/faucet

#### Ventajas de Scroll

- **Bajas comisiones**: Transacciones económicas
- **Rápida confirmación**: Bloques cada 3 segundos
- **Compatibilidad EVM**: Compatible con Ethereum
- **Layer 2**: Hereda seguridad de Ethereum

---

### 5. React + TypeScript

**Propósito**: Framework frontend para UI reactiva y type-safe.

#### Stack Frontend

- **React 18**: Librería de componentes
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Estilos utility-first
- **Lucide React**: Iconos

#### Estructura de Componentes

```
src/
├── components/
│   ├── AuthForm.tsx           # Formulario de autenticación
│   ├── ActivationFlow.tsx     # Flujo de activación
│   ├── CheckInForm.tsx        # Formulario de check-in
│   ├── Dashboard.tsx          # Dashboard de analytics
│   ├── Navigation.tsx         # Barra de navegación
│   └── BlockchainVerification.tsx  # Verificación blockchain
├── contexts/
│   └── AuthContext.tsx        # Contexto de autenticación
└── lib/
    ├── supabase.ts            # Cliente Supabase
    ├── blockchain.ts          # Utilidades blockchain
    ├── web3.ts                # Conexión Web3
    └── contract.ts            # ABI y dirección del contrato
```

---

## Instalación y Configuración

### Prerrequisitos

- Node.js 18+ instalado
- npm o yarn
- MetaMask instalado
- Cuenta de Supabase
- ETH de testnet en Scroll Sepolia

### Pasos de Instalación

1. **Clonar Repositorio**

```bash
git clone <repository-url>
cd talentwell
```

2. **Instalar Dependencias**

```bash
npm install
```

3. **Configurar Variables de Entorno**

Crear archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Configurar Supabase**

- Crear proyecto en [supabase.com](https://supabase.com)
- Ejecutar migraciones en SQL Editor:
  - `supabase/migrations/20251028020026_create_talentwell_schema.sql`
  - `supabase/migrations/20251028022804_add_blockchain_tx_hash.sql`

5. **Desplegar Smart Contract**

- Seguir guía en [Despliegue del Contrato](#despliegue-del-contrato)
- Actualizar `CONTRACT_ADDRESS` en `src/lib/contract.ts`

6. **Iniciar Aplicación**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

7. **Build para Producción**

```bash
npm run build
```

Los archivos optimizados estarán en `/dist`

---

## Stack Tecnológico

### Frontend
- **React 18.3**: Librería UI
- **TypeScript 5.5**: Superset de JavaScript con tipos
- **Vite 5.4**: Build tool y dev server
- **Tailwind CSS 3.4**: Framework CSS utility-first
- **Lucide React**: Librería de iconos

### Backend & Database
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Base de datos relacional
- **Supabase Auth**: Sistema de autenticación

### Blockchain
- **Solidity 0.8.20**: Lenguaje de smart contracts
- **Ethers.js 6.15**: Librería Web3
- **Scroll Sepolia**: Red Layer 2 de Ethereum
- **MetaMask**: Wallet de navegador

### Tools & DevOps
- **ESLint**: Linter de código
- **PostCSS**: Procesador CSS
- **Remix IDE**: IDE para Solidity

---

## Recursos Adicionales

### Documentación

- [Supabase Docs](https://supabase.com/docs)
- [Ethers.js Docs](https://docs.ethers.org/)
- [Scroll Docs](https://docs.scroll.io/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [React Docs](https://react.dev/)

### Exploradores de Bloques

- [Scroll Sepolia Explorer](https://sepolia.scrollscan.com/)
- [Contrato TalentWell](https://sepolia.scrollscan.com/address/0x2B439F8B6F9afB05c7E9008Cc72EFa1C929d2bC2)

### Faucets

- [Scroll Sepolia Faucet](https://sepolia.scroll.io/faucet)

---

## Casos de Uso Específicos

### Caso de Uso #1: Registro de Nuevo Usuario

**Actor:** Empleado nuevo de una empresa
**Objetivo:** Crear una cuenta y activarla para poder realizar check-ins emocionales

**Precondiciones:**
- El usuario tiene un código de activación válido proporcionado por su empresa
- El usuario tiene acceso a un navegador web

**Flujo Principal:**
1. El usuario accede a la aplicación TalentWell
2. Hace clic en el botón "Registrarse"
3. Completa el formulario con:
   - Email corporativo (ejemplo: `juan.perez@empresa.com`)
   - Contraseña segura (mínimo 6 caracteres)
   - Código de activación (ejemplo: `DEMO2025`)
4. El sistema valida que:
   - El email no esté registrado previamente
   - El código de activación existe en la base de datos
   - El código no haya sido usado anteriormente
5. El sistema crea el usuario en Supabase Auth
6. El sistema marca el código como usado
7. El sistema vincula al usuario con la empresa correspondiente
8. El usuario es redirigido automáticamente al dashboard

**Resultado Exitoso:**
- Usuario creado exitosamente
- Sesión iniciada automáticamente
- Redirigido a la vista de Check-in
- Mensaje mostrado: "Cuenta activada exitosamente. ¡Bienvenido a TalentWell!"

**Errores Posibles:**

| Error | Causa | Mensaje Mostrado |
|-------|-------|------------------|
| Código inválido | Código no existe en la BD | "Código de activación inválido" |
| Código ya usado | Código ya fue utilizado | "Este código ya ha sido utilizado" |
| Email duplicado | Email ya registrado | "Este email ya está registrado" |
| Contraseña débil | Menos de 6 caracteres | "La contraseña debe tener al menos 6 caracteres" |
| Error de red | Falla conexión Supabase | "Error de conexión. Intenta nuevamente" |

**Tecnología Sugerida (Para Bolt):**
```
- Frontend: React + TypeScript
- UI: Tailwind CSS con componentes de formulario
- Autenticación: Supabase Auth (signUp)
- Validación: React Hook Form + Zod
- Estado: React Context API
- Notificaciones: Toast notifications con Sonner
```

---

### Caso de Uso #2: Inicio de Sesión

**Actor:** Usuario registrado (Empleado o Gerente)
**Objetivo:** Acceder a su cuenta para realizar check-ins o ver analytics

**Precondiciones:**
- El usuario tiene una cuenta previamente registrada y activada
- El usuario conoce su email y contraseña

**Flujo Principal:**
1. El usuario accede a la aplicación TalentWell
2. Introduce su email en el campo correspondiente
3. Introduce su contraseña
4. Hace clic en "Iniciar sesión"
5. El sistema valida las credenciales en Supabase Auth
6. El sistema recupera los datos del usuario (rol, empresa)
7. El usuario es redirigido según su rol:
   - Empleados: Vista de Check-in
   - Gerentes: Dashboard de Analytics

**Resultado Exitoso:**
- Sesión iniciada correctamente
- Token JWT almacenado en el navegador
- Redirigido a la vista correspondiente
- Navegación activada con opciones según el rol

**Errores Posibles:**

| Error | Causa | Mensaje Mostrado |
|-------|-------|------------------|
| Credenciales incorrectas | Email o contraseña inválidos | "Email o contraseña incorrectos" |
| Cuenta no encontrada | Usuario no existe | "No existe una cuenta con este email" |
| Cuenta inactiva | Activación pendiente | "Tu cuenta está pendiente de activación" |
| Error de red | Falla conexión Supabase | "Error de conexión. Intenta nuevamente" |
| Sesión expirada | Token JWT caducado | "Tu sesión ha expirado. Por favor inicia sesión nuevamente" |

**Tecnología Sugerida (Para Bolt):**
```
- Frontend: React + TypeScript
- Autenticación: Supabase Auth (signInWithPassword)
- Persistencia: LocalStorage para token
- Estado global: AuthContext con React Context
- Protección de rutas: Private Route wrapper
- Redirección: React Router v6
```

---

### Caso de Uso #3: Realizar Check-in Emocional Diario

**Actor:** Empleado autenticado
**Objetivo:** Registrar su estado emocional del día y almacenarlo en blockchain

**Precondiciones:**
- El usuario ha iniciado sesión
- No ha realizado un check-in en el día actual
- Tiene MetaMask instalado
- Tiene ETH de testnet en su wallet de Scroll Sepolia

**Flujo Principal:**
1. El usuario navega a la sección "Check-in"
2. Visualiza cinco opciones emocionales con iconos:
   - Excelente (100 puntos) - icono verde
   - Bien (75 puntos) - icono verde claro
   - Normal (50 puntos) - icono amarillo
   - Estresado (40 puntos) - icono naranja
   - Agotado (20 puntos) - icono rojo
3. Selecciona el estado que mejor describe su día
4. Opcionalmente, escribe un comentario (máximo 200 caracteres)
5. Hace clic en "Enviar Check-in"
6. El sistema genera un hash SHA-256 anónimo del registro
7. El sistema guarda el check-in en la base de datos Supabase
8. El sistema solicita conexión con MetaMask
9. El usuario aprueba la conexión
10. El sistema verifica que esté en Scroll Sepolia (si no, solicita cambio)
11. El usuario aprueba el cambio de red (si es necesario)
12. El sistema envía transacción al smart contract
13. El usuario confirma la transacción en MetaMask (paga gas)
14. El sistema espera confirmación de la transacción
15. El sistema guarda el transaction hash en la base de datos
16. Se muestra mensaje de éxito con panel de verificación blockchain

**Resultado Exitoso:**
- Check-in guardado en Supabase con ID único
- Hash registrado en blockchain (contrato TalentWellRegistry)
- Transaction hash guardado en la BD
- Mensaje mostrado: "Check-in registrado exitosamente en blockchain"
- Panel de verificación visible con:
  - Hash anónimo (primeros 20 caracteres)
  - Timestamp del registro
  - Enlace al contrato en Scrollscan
  - Enlace a la transacción en Scrollscan
  - Botón "Verificar en Blockchain"

**Errores Posibles:**

| Error | Causa | Mensaje Mostrado |
|-------|-------|------------------|
| Check-in duplicado | Ya existe check-in hoy | "Ya has realizado tu check-in de hoy. Vuelve mañana para tu próximo check-in." |
| MetaMask no instalado | Extensión no detectada | "MetaMask no está instalado. Por favor instala MetaMask para continuar." |
| Usuario rechaza conexión | Usuario cancela en MetaMask | "Conexión rechazada. Necesitas conectar tu wallet para registrar el check-in." |
| Red incorrecta | No está en Scroll Sepolia | "Por favor cambia a Scroll Sepolia Testnet en MetaMask" |
| Usuario rechaza transacción | Usuario cancela en MetaMask | "Transacción cancelada. El check-in no fue registrado en blockchain." |
| Fondos insuficientes | No hay ETH para gas | "Fondos insuficientes para pagar el gas. Obtén ETH de testnet desde el faucet." |
| Transacción fallida | Error en el smart contract | "Error al registrar en blockchain. Por favor intenta nuevamente." |
| Error de red | Falla RPC de Scroll | "Error de conexión con la red blockchain. Intenta nuevamente." |

**Tecnología Sugerida (Para Bolt):**
```
- Frontend: React + TypeScript
- Blockchain: Ethers.js v6 para Web3
- Wallet: MetaMask (window.ethereum)
- Base de datos: Supabase (insert + update)
- Hashing: ethers.keccak256 para generar hash
- Smart Contract: TalentWellRegistry en Scroll Sepolia
- UI: Estados de loading con spinners
- Feedback: Toast notifications + modal de confirmación
```

---

### Caso de Uso #4: Verificar Check-in en Blockchain

**Actor:** Empleado autenticado que ha realizado un check-in
**Objetivo:** Verificar que su check-in existe en blockchain y consultar sus datos

**Precondiciones:**
- El usuario ha realizado un check-in previamente
- El check-in fue registrado exitosamente en blockchain
- Tiene MetaMask instalado y conectado

**Flujo Principal:**
1. El usuario visualiza su check-in del día con el panel de verificación
2. Observa el hash anónimo y los enlaces al contrato
3. Hace clic en el botón "Verificar en Blockchain"
4. El sistema conecta con MetaMask (solo lectura, sin transacción)
5. El sistema llama a la función `verifyCheckIn(hash)` del contrato
6. El smart contract busca el hash en sus registros
7. El smart contract retorna:
   - exists: true
   - timestamp: momento del registro
   - score: puntuación emocional (20-100)
8. El sistema muestra un mensaje de confirmación verde
9. Se visualizan los datos verificados:
   - Score original del check-in
   - Timestamp de la blockchain
   - Estado: "Verificado en Blockchain" con checkmark verde

**Resultado Exitoso:**
- Verificación exitosa mostrada con badge verde
- Datos on-chain coinciden con datos en BD
- Mensaje mostrado: "✓ Verificado en Blockchain"
- Información adicional visible:
  - Score: [puntuación]/100
  - Timestamp: [fecha y hora formateada]
  - Confirmación de inmutabilidad

**Errores Posibles:**

| Error | Causa | Mensaje Mostrado |
|-------|-------|------------------|
| Hash no encontrado | Check-in no existe on-chain | "Check-in no encontrado en blockchain. La transacción podría estar pendiente." |
| MetaMask no conectado | Wallet desconectado | "Por favor conecta tu wallet MetaMask para verificar" |
| Red incorrecta | No está en Scroll Sepolia | "Cambia a Scroll Sepolia Testnet para verificar" |
| Error de RPC | Falla conexión blockchain | "Error al consultar blockchain. Intenta nuevamente." |
| Transacción pendiente | Tx aún no confirmada | "La transacción está siendo procesada. Por favor espera unos segundos." |

**Flujo Alternativo: Ver Transacción en Scrollscan**
1. El usuario hace clic en "Ver transacción"
2. Se abre nueva pestaña en Scrollscan
3. Se muestra la página de la transacción con:
   - Block number
   - From address (wallet del usuario)
   - To address (contrato TalentWellRegistry)
   - Gas usado
   - Timestamp
   - Status: Success ✓
   - Input Data (con el hash)

**Tecnología Sugerida (Para Bolt):**
```
- Frontend: React + TypeScript
- Blockchain: Ethers.js (solo lectura, no gas)
- Smart Contract: Método view verifyCheckIn(bytes32)
- UI: Loading state + success/error states
- Enlaces externos: target="_blank" con noopener
- Formato de datos: Date formatting con Intl
```

---

### Caso de Uso #5: Visualizar Dashboard de Analytics (Gerente)

**Actor:** Gerente autenticado
**Objetivo:** Visualizar métricas agregadas de bienestar del equipo para tomar decisiones

**Precondiciones:**
- El usuario tiene rol de "manager"
- Existen check-ins registrados en su empresa
- Ha iniciado sesión correctamente

**Flujo Principal:**
1. El gerente inicia sesión o navega a "Analytics"
2. El sistema consulta todos los check-ins de su empresa
3. El sistema calcula métricas agregadas:
   - Promedio actual de bienestar (0-100)
   - Total de check-ins registrados
   - Tendencia de últimos 30 días
4. El sistema genera un gráfico de líneas con evolución diaria
5. Se muestran tres tarjetas principales:
   - **Card 1**: Promedio de bienestar (número grande + indicador visual)
   - **Card 2**: Total de check-ins (contador + icono)
   - **Card 3**: Tendencia (gráfico de línea + porcentaje)
6. Se muestra gráfico interactivo con:
   - Eje X: Fechas de los últimos 30 días
   - Eje Y: Promedio de score (0-100)
   - Línea de tendencia con colores según nivel
7. El gerente puede:
   - Ver tooltips al pasar el mouse sobre puntos
   - Identificar días con bajos scores
   - Observar patrones semanales o mensuales

**Resultado Exitoso:**
- Dashboard cargado con datos en tiempo real
- Métricas calculadas correctamente:
  - Promedio: 68/100 (ejemplo)
  - Total check-ins: 245 (ejemplo)
  - Tendencia: +5% última semana (ejemplo)
- Gráfico renderizado correctamente
- Colores indicativos:
  - Verde: >70 puntos (bienestar alto)
  - Amarillo: 50-70 (bienestar medio)
  - Rojo: <50 (alerta, requiere atención)

**Errores Posibles:**

| Error | Causa | Mensaje Mostrado |
|-------|-------|------------------|
| Sin datos | No hay check-ins registrados | "No hay datos disponibles. Los empleados aún no han realizado check-ins." |
| Acceso denegado | Usuario no es gerente | "No tienes permisos para acceder a esta sección. Solo gerentes pueden ver analytics." |
| Error de consulta | Falla query a Supabase | "Error al cargar datos. Por favor recarga la página." |
| Período sin datos | No hay check-ins en rango | "No hay datos para el período seleccionado." |

**Flujo Alternativo: Filtrar por Período**
1. El gerente selecciona un período diferente:
   - Última semana
   - Últimos 30 días (default)
   - Últimos 90 días
   - Todo el tiempo
2. El sistema recalcula las métricas para el nuevo rango
3. El gráfico se actualiza con la nueva información

**Consideraciones de Privacidad:**
- Los datos son agregados y anónimos
- No se muestran check-ins individuales
- No se pueden identificar empleados específicos
- Solo promedios y tendencias grupales
- Cumple con GDPR y regulaciones de privacidad

**Tecnología Sugerida (Para Bolt):**
```
- Frontend: React + TypeScript
- Gráficos: Recharts o Chart.js
- Cálculos: JavaScript nativo para promedios
- Query: Supabase con RLS (managers only)
- Filtros: React State + useMemo para performance
- UI: Tailwind CSS con componentes card
- Loading: Skeleton loaders
- Export: React-to-PDF (opcional)
```

---

### Caso de Uso #6: Configurar MetaMask para Scroll Sepolia

**Actor:** Nuevo usuario que va a realizar su primer check-in
**Objetivo:** Configurar correctamente MetaMask para usar Scroll Sepolia Testnet

**Precondiciones:**
- El usuario tiene MetaMask instalado
- El usuario intenta realizar un check-in por primera vez
- No tiene Scroll Sepolia configurado

**Flujo Principal:**
1. El usuario hace clic en "Enviar Check-in"
2. El sistema solicita conexión con MetaMask
3. El usuario aprueba la conexión
4. El sistema detecta que no está en Scroll Sepolia
5. El sistema muestra modal: "Red incorrecta detectada"
6. El sistema solicita automáticamente cambio de red
7. Aparece popup de MetaMask con información de la red:
   - Network Name: Scroll Sepolia Testnet
   - RPC URL: https://sepolia-rpc.scroll.io
   - Chain ID: 534351
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.scrollscan.com/
8. El usuario hace clic en "Aprobar" en MetaMask
9. La red se agrega automáticamente
10. MetaMask cambia a la nueva red
11. El sistema detecta el cambio exitoso
12. El check-in procede normalmente

**Resultado Exitoso:**
- Red Scroll Sepolia agregada a MetaMask
- Wallet conectado en la red correcta
- Listo para realizar transacciones
- Mensaje mostrado: "✓ Conectado a Scroll Sepolia Testnet"

**Errores Posibles:**

| Error | Causa | Mensaje Mostrado |
|-------|-------|------------------|
| Usuario rechaza | Cancela en MetaMask | "Cambio de red cancelado. Necesitas estar en Scroll Sepolia para continuar." |
| MetaMask bloqueado | Wallet con contraseña | "Desbloquea MetaMask para continuar" |
| Configuración manual | Rechazo automático | "Por favor configura Scroll Sepolia manualmente en MetaMask. [Mostrar instrucciones]" |

**Flujo Alternativo: Configuración Manual**
1. El usuario rechaza la configuración automática
2. El sistema muestra instrucciones paso a paso:
   ```
   1. Abre MetaMask
   2. Click en el selector de red
   3. Click en "Agregar red"
   4. Click en "Agregar red manualmente"
   5. Completa los siguientes datos:
      - Network Name: Scroll Sepolia Testnet
      - RPC URL: https://sepolia-rpc.scroll.io
      - Chain ID: 534351
      - Currency Symbol: ETH
      - Block Explorer: https://sepolia.scrollscan.com/
   6. Click en "Guardar"
   7. Selecciona la nueva red
   ```
3. Una vez configurado, el usuario vuelve a intentar el check-in

**Tecnología Sugerida (Para Bolt):**
```
- Web3: Ethers.js para detectar red
- MetaMask API: wallet_addEthereumChain
- UI: Modal con instrucciones claras
- Validación: Chain ID comparison
- Feedback: Visual indicators de conexión
```

---

### Caso de Uso #7: Obtener ETH de Testnet (Faucet)

**Actor:** Usuario que necesita ETH para transacciones
**Objetivo:** Obtener ETH gratuito de testnet para pagar gas fees

**Precondiciones:**
- El usuario tiene MetaMask configurado en Scroll Sepolia
- No tiene suficiente ETH para realizar transacciones
- Tiene acceso a internet

**Flujo Principal:**
1. El usuario intenta realizar un check-in
2. MetaMask muestra error: "Fondos insuficientes"
3. El sistema detecta el error y muestra mensaje:
   "No tienes suficiente ETH para pagar el gas. [Obtener ETH gratis]"
4. El usuario hace clic en el enlace
5. Se abre nueva pestaña con el faucet de Scroll Sepolia
6. El usuario conecta su wallet en el faucet
7. El usuario hace clic en "Request ETH" o similar
8. El faucet procesa la solicitud (puede requerir CAPTCHA)
9. El faucet envía 0.1 - 0.5 ETH a la wallet del usuario
10. El usuario espera la confirmación (15-30 segundos)
11. El balance se actualiza en MetaMask
12. El usuario vuelve a TalentWell
13. Intenta nuevamente el check-in (ahora con fondos suficientes)

**Resultado Exitoso:**
- ETH recibido en la wallet (visible en MetaMask)
- Balance actualizado
- Listo para realizar transacciones
- Puede completar su check-in sin problemas

**Errores Posibles:**

| Error | Causa | Mensaje Mostrado |
|-------|-------|------------------|
| Límite diario alcanzado | Ya usó faucet hoy | "Has alcanzado el límite diario del faucet. Intenta mañana." |
| Faucet no disponible | Servicio caído | "El faucet no está disponible temporalmente. Intenta más tarde." |
| Wallet ya financiada | Ya tiene suficiente ETH | "Tu wallet ya tiene suficiente ETH." |

**Recursos del Faucet:**
- URL Principal: https://sepolia.scroll.io/faucet
- Alternativas: https://scroll-sepolia-faucet.com
- Discord: Solicitar en canal de faucet de Scroll

**Tecnología Sugerida (Para Bolt):**
```
- Detección: Catch error "insufficient funds"
- UI: Link directo al faucet en mensajes de error
- Ayuda: Tooltip con instrucciones del faucet
- Validación: Polling de balance cada 5 segundos
- Notificación: Alert cuando balance cambia
```

---

### Caso de Uso #8: Recuperar Contraseña

**Actor:** Usuario que olvidó su contraseña
**Objetivo:** Restablecer su contraseña para acceder a su cuenta

**Precondiciones:**
- El usuario tiene una cuenta registrada
- Tiene acceso al email registrado

**Flujo Principal:**
1. El usuario está en la pantalla de inicio de sesión
2. Hace clic en "¿Olvidaste tu contraseña?"
3. Se muestra formulario de recuperación
4. Introduce su email registrado
5. Hace clic en "Enviar enlace de recuperación"
6. El sistema valida que el email existe
7. Supabase Auth envía email con enlace mágico
8. El usuario revisa su email
9. Hace clic en el enlace de recuperación
10. Es redirigido a página de nueva contraseña
11. Introduce su nueva contraseña (2 veces para confirmar)
12. Hace clic en "Actualizar contraseña"
13. El sistema valida y actualiza la contraseña
14. El usuario es redirigido a login
15. Puede iniciar sesión con la nueva contraseña

**Resultado Exitoso:**
- Email de recuperación enviado
- Mensaje mostrado: "Revisa tu email. Hemos enviado un enlace para restablecer tu contraseña."
- Contraseña actualizada exitosamente
- Mensaje mostrado: "Contraseña actualizada correctamente. Ya puedes iniciar sesión."

**Errores Posibles:**

| Error | Causa | Mensaje Mostrado |
|-------|-------|------------------|
| Email no encontrado | No existe cuenta | "No existe una cuenta con este email" |
| Email no enviado | Error SMTP | "Error al enviar el email. Intenta nuevamente." |
| Enlace expirado | Pasaron más de 1 hora | "Este enlace ha expirado. Solicita uno nuevo." |
| Contraseñas no coinciden | Campos diferentes | "Las contraseñas no coinciden" |
| Contraseña débil | Menos de 6 caracteres | "La contraseña debe tener al menos 6 caracteres" |

**Tecnología Sugerida (Para Bolt):**
```
- Autenticación: Supabase Auth (resetPasswordForEmail)
- Email: Configuración de templates en Supabase
- UI: Formulario con validación en tiempo real
- Redirección: Manejo de magic link callback
- Seguridad: Rate limiting para prevenir spam
```

---

### Caso de Uso #9: Cerrar Sesión

**Actor:** Usuario autenticado (Empleado o Gerente)
**Objetivo:** Salir de su cuenta de forma segura

**Precondiciones:**
- El usuario ha iniciado sesión
- Tiene sesión activa

**Flujo Principal:**
1. El usuario hace clic en su avatar/nombre en la barra de navegación
2. Aparece dropdown con opciones
3. Hace clic en "Cerrar sesión"
4. El sistema llama a `supabase.auth.signOut()`
5. El sistema limpia el token JWT del navegador
6. El sistema limpia el estado global de autenticación
7. El sistema desconecta MetaMask (opcional)
8. El usuario es redirigido a la pantalla de login
9. Se muestra mensaje: "Sesión cerrada exitosamente"

**Resultado Exitoso:**
- Sesión cerrada correctamente
- Token eliminado de LocalStorage
- Usuario redirigido a login
- Estado global limpio
- Ya no puede acceder a rutas protegidas

**Errores Posibles:**

| Error | Causa | Mensaje Mostrado |
|-------|-------|------------------|
| Error de red | Falla conexión Supabase | "Error al cerrar sesión. Intenta nuevamente." |
| Sesión ya cerrada | Token ya expiró | Usuario simplemente redirigido a login sin mensaje |

**Tecnología Sugerida (Para Bolt):**
```
- Autenticación: Supabase Auth (signOut)
- Estado: Limpieza de AuthContext
- Almacenamiento: Clear LocalStorage
- Redirección: React Router navigate
- UI: Dropdown menu con Headless UI
```

---

### Caso de Uso #10: Manejar Error de Sesión Expirada

**Actor:** Usuario con sesión activa que expira
**Objetivo:** Manejar gracefully la expiración y reautenticar

**Precondiciones:**
- El usuario ha iniciado sesión
- Han pasado más de 24 horas desde el login
- El JWT ha expirado

**Flujo Principal:**
1. El usuario está usando la aplicación
2. Intenta realizar una acción (ej: check-in)
3. El sistema detecta que el token JWT expiró
4. El sistema muestra modal: "Tu sesión ha expirado"
5. El usuario hace clic en "Iniciar sesión nuevamente"
6. Es redirigido a la pantalla de login
7. Inicia sesión con sus credenciales
8. Es redirigido de vuelta a donde estaba
9. Puede continuar su acción original

**Resultado Exitoso:**
- Detección automática de sesión expirada
- Usuario informado claramente
- Proceso de reautenticación fluido
- Vuelta a la acción original sin pérdida de contexto

**Errores Posibles:**

| Error | Causa | Mensaje Mostrado |
|-------|-------|------------------|
| Credenciales incorrectas al relogin | Usuario olvidó contraseña | "Email o contraseña incorrectos" (con link a recuperación) |

**Tecnología Sugerida (Para Bolt):**
```
- Detección: Axios/Fetch interceptor para 401
- UI: Modal de sesión expirada
- Persistencia: Guardar ruta actual antes de redirigir
- Reautenticación: Supabase Auth
- Redirección: Volver a ruta guardada post-login
```

---

## Tecnología Sugerida General para Bolt

### Stack Recomendado

**Frontend Core:**
```
- Framework: React 18.3 con TypeScript 5.5
- Build Tool: Vite 5.4 (ultra rápido)
- Router: React Router v6
- Estado: Context API + hooks
- Formularios: React Hook Form
- Validación: Zod
```

**UI/UX:**
```
- CSS: Tailwind CSS 3.4
- Componentes: Headless UI (accessible)
- Iconos: Lucide React
- Animaciones: Framer Motion
- Notificaciones: Sonner o React Hot Toast
- Modales: Radix UI
- Gráficos: Recharts o Chart.js
```

**Backend & Database:**
```
- BaaS: Supabase (PostgreSQL + Auth + Storage)
- ORM: Supabase Client JS
- Autenticación: Supabase Auth
- Seguridad: Row Level Security (RLS)
```

**Blockchain:**
```
- Librería Web3: Ethers.js v6
- Wallet: MetaMask integration
- Red: Scroll Sepolia Testnet (L2)
- Smart Contract: Solidity 0.8.20
- IDE: Remix para deployment
```

**Developer Experience:**
```
- Linting: ESLint + TypeScript ESLint
- Formatting: Prettier
- Git Hooks: Husky + lint-staged
- Testing: Vitest + React Testing Library
- E2E: Playwright (opcional)
```

**Deployment:**
```
- Hosting: Vercel, Netlify o Cloudflare Pages
- CI/CD: GitHub Actions
- Environment: .env con Vite
- Build: npm run build (optimizado)
```

### Mensajes de Éxito y Error Existentes en la Aplicación

#### Mensajes de Éxito ✅

| Componente | Acción | Mensaje |
|------------|--------|---------|
| AuthForm (SignUp) | Registro exitoso | "Cuenta activada exitosamente. ¡Bienvenido a TalentWell!" |
| AuthForm (Login) | Login exitoso | Sin mensaje, redirección directa |
| CheckInForm | Check-in guardado | "Check-in registrado exitosamente en blockchain" |
| CheckInForm | Check-in duplicado | "Ya has realizado tu check-in de hoy. Vuelve mañana para tu próximo check-in." |
| BlockchainVerification | Verificación exitosa | "✓ Verificado en Blockchain" |
| ActivationFlow | Código validado | "Código válido. Procede con tu registro." |

#### Mensajes de Error ❌

| Componente | Error | Mensaje |
|------------|-------|---------|
| AuthForm | Email duplicado | "Este email ya está registrado" |
| AuthForm | Código inválido | "Código de activación inválido" |
| AuthForm | Código usado | "Este código ya ha sido utilizado" |
| AuthForm | Credenciales incorrectas | "Email o contraseña incorrectos" |
| AuthForm | Error genérico | "Error al iniciar sesión. Intenta nuevamente" |
| CheckInForm | Check-in duplicado | "Ya has realizado tu check-in de hoy" |
| CheckInForm | Error de guardado | "Error al registrar check-in" |
| BlockchainVerification | Hash no encontrado | "Check-in no encontrado en blockchain" |
| BlockchainVerification | Error de verificación | "Error al verificar" |
| Web3 Connection | MetaMask no instalado | "MetaMask no está instalado" |
| Web3 Connection | Usuario rechaza | "Conexión rechazada" |
| Web3 Connection | Fondos insuficientes | "Fondos insuficientes para pagar el gas" |
| Web3 Connection | Transacción fallida | "Error al registrar en blockchain" |
| Dashboard | Sin datos | "No hay datos disponibles" |
| Dashboard | Error de carga | "Error al cargar datos" |

#### Colores de Mensajes (Tailwind CSS)

**Éxito (Verde):**
```css
bg-green-50 border-green-200 text-green-700
```

**Error (Rojo):**
```css
bg-red-50 border-red-200 text-red-600
```

**Advertencia (Amarillo):**
```css
bg-yellow-50 border-yellow-200 text-yellow-800
```

**Información (Azul):**
```css
bg-blue-50 border-blue-200 text-blue-700
```

---

## Implementación de Zero-Knowledge (ZK) en TalentWell

### Estado Actual: Privacidad mediante Hashing Anónimo

TalentWell actualmente implementa un nivel básico pero efectivo de privacidad utilizando hashing SHA-256, que sienta las bases para una futura implementación completa de Zero-Knowledge Proofs (ZK-Proofs).

### 1. ¿Qué es Zero-Knowledge?

Zero-Knowledge Proofs (ZK-Proofs) son protocolos criptográficos que permiten demostrar que una afirmación es verdadera sin revelar ninguna información adicional más allá de la veracidad de la afirmación.

**Ejemplo en TalentWell:**
- **Sin ZK**: "Mi score es 75 puntos"
- **Con ZK básico (actual)**: "Registré un check-in" (sin revelar score exacto ni identidad)
- **Con ZK avanzado (futuro)**: "Mi score es mayor a 50" (sin revelar el valor exacto ni identidad)

---

### 2. Implementación Actual: Hashing Anónimo

#### Tecnología Utilizada

**Archivo:** `src/lib/blockchain.ts`

```typescript
import { ethers } from 'ethers';

export function generateCheckInHash(
  userId: string,
  emotion: string,
  score: number,
  timestamp: number
): string {
  const dataString = `${userId}-${emotion}-${score}-${timestamp}`;
  return ethers.keccak256(ethers.toUtf8Bytes(dataString));
}
```

#### Cómo Funciona

1. **Generación de Hash Anónimo**
   - Se concatenan los datos del check-in: `userId-emotion-score-timestamp`
   - Se aplica función hash Keccak256 (mismo que usa Ethereum)
   - Resultado: Hash de 32 bytes (64 caracteres hexadecimales)
   - Ejemplo: `0x8f7b3c2d1e9a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c`

2. **Propiedades del Hash**
   - **Irreversible**: Imposible obtener datos originales del hash
   - **Determinístico**: Mismo input siempre produce mismo hash
   - **Único**: Cambio mínimo en input produce hash completamente diferente
   - **Colisión resistente**: Prácticamente imposible que dos inputs diferentes den mismo hash

3. **Registro en Blockchain**
   ```typescript
   // Solo se guarda el hash y el score, NO datos personales
   await contract.registerCheckIn(hash, score);
   ```

4. **Almacenamiento en Smart Contract**
   ```solidity
   struct CheckInRecord {
       bytes32 checkInHash;  // Hash anónimo
       uint256 timestamp;     // Timestamp del bloque
       uint8 score;           // Solo puntuación (0-100)
       bool exists;           // Flag de existencia
   }
   ```

#### Nivel de Privacidad Actual

**✅ Protecciones Implementadas:**

| Dato Personal | ¿Se almacena on-chain? | ¿Es visible públicamente? |
|---------------|------------------------|---------------------------|
| Nombre del usuario | ❌ NO | ❌ NO |
| Email | ❌ NO | ❌ NO |
| User ID (UUID) | ❌ NO (solo en hash) | ❌ NO |
| Emoción exacta | ❌ NO (solo en hash) | ❌ NO |
| Comentario | ❌ NO | ❌ NO |
| Wallet address | ✅ SÍ (transacción) | ✅ SÍ (pero no vinculada a identidad) |
| Score | ✅ SÍ | ✅ SÍ (anónimo) |
| Timestamp | ✅ SÍ | ✅ SÍ (anónimo) |
| Hash del check-in | ✅ SÍ | ✅ SÍ (irreversible) |

**Resultado:** Los datos on-chain son completamente anónimos. Solo scores y timestamps sin vincular a identidades.

---

### 3. ¿Por qué no es ZK completo todavía?

Aunque TalentWell implementa privacidad mediante hashing, no es un sistema ZK completo porque:

#### Limitaciones Actuales

1. **No hay Pruebas Criptográficas**
   - Actual: "Aquí está el hash" (verificación directa)
   - ZK ideal: "Puedo probar que conozco el valor sin revelarlo"

2. **Score Visible**
   - Actual: Score almacenado en plaintext on-chain (75 puntos)
   - ZK ideal: "Mi score está en el rango 70-80" (sin revelar valor exacto)

3. **No hay Predicados Zero-Knowledge**
   - Actual: No se pueden hacer queries como "¿cuántos empleados tienen score > 50?"
   - ZK ideal: Estadísticas agregadas sin revelar datos individuales

4. **Wallet Linkability**
   - Actual: Todas las transacciones visibles desde una misma wallet
   - ZK ideal: Transacciones desvinculadas, privacidad total

---

### 4. Roadmap hacia ZK Completo

#### Fase 1: Privacidad Básica ✅ (Actual)
- ✅ Hashing SHA-256/Keccak256
- ✅ Datos personales nunca on-chain
- ✅ Solo hash anónimos
- ✅ RLS en base de datos

#### Fase 2: ZK-SNARKs para Rangos (Futuro Q2 2025)
**Tecnología:** zkSync, Polygon zkEVM, o StarkNet

**Implementación:**
```solidity
// Probar que score > threshold sin revelar score exacto
function proveScoreAboveThreshold(
    zkProof calldata proof,
    uint8 threshold
) external returns (bool) {
    // Verifica proof sin revelar score real
    return zkVerifier.verify(proof, threshold);
}
```

**Casos de Uso:**
- "Mi bienestar es aceptable" (score > 50) → ZK proof sin revelar valor exacto
- "No estoy en crisis" (score > 30) → Alerta gerente sin exponer identidad
- Estadísticas: "70% del equipo está bien" → Sin revelar quiénes son

#### Fase 3: Privacidad Total con zk-Rollups (Futuro Q4 2025)
**Tecnología:** zkSync Era, Aztec Protocol

**Implementación:**
- Todas las transacciones privadas por defecto
- Identidad del usuario oculta
- Solo pruebas ZK verificables
- Compliance sin sacrificar privacidad

**Arquitectura:**
```
Usuario → Genera ZK-Proof local
       ↓
       → Envía proof (NO datos reales)
       ↓
Smart Contract → Verifica proof
       ↓
       → Acepta/Rechaza SIN saber datos
```

#### Fase 4: Análisis Privado con FHE (Futuro 2026)
**Tecnología:** Fully Homomorphic Encryption (FHE)

**Capacidades:**
- Cálculos sobre datos encriptados
- Dashboard de gerente con estadísticas sin desencriptar datos
- Machine Learning sobre datos privados
- Alertas automáticas preservando anonimato

---

### 5. Comparación: Privacidad Actual vs ZK Completo

| Característica | Implementación Actual | ZK Completo (Futuro) |
|----------------|----------------------|----------------------|
| **Anonimato de Usuario** | Alto (hash irreversible) | Total (ZK-SNARKs) |
| **Score Privado** | No (visible on-chain) | Sí (solo rangos verificables) |
| **Wallet Privada** | No (address visible) | Sí (stealth addresses) |
| **Verificación** | Directa (hash matching) | Criptográfica (ZK proof) |
| **Queries Privadas** | No soportadas | Sí (FHE + ZK) |
| **Gas Costs** | Bajos (~0.0001 ETH) | Medios-Altos (proofs más costosos) |
| **Complejidad** | Baja (hashing estándar) | Alta (ZK circuits) |
| **Cumplimiento GDPR** | Parcial | Total |

---

### 6. Tecnologías ZK Candidatas para TalentWell

#### Opción 1: zkSync Era
**Ventajas:**
- Layer 2 de Ethereum con ZK-Rollups nativos
- Bajas comisiones (~$0.01 por transacción)
- Compatible con contratos Solidity existentes
- Soporte para zk-SNARKs out-of-the-box

**Integración:**
```bash
# Migración a zkSync
npm install -D @matterlabs/hardhat-zksync-solc
npm install zksync-web3
```

#### Opción 2: Polygon zkEVM
**Ventajas:**
- EVM-compatible al 100%
- Migración casi sin cambios de código
- Red madura con alto tráfico

#### Opción 3: Aztec Protocol
**Ventajas:**
- Privacidad by default
- Contratos privados nativos
- SDK completo para ZK

**Desventajas:**
- Curva de aprendizaje más pronunciada
- Menor compatibilidad con Ethereum

---

### 7. Cómo Verificar la Privacidad Actual

#### Test 1: Verificar que no hay datos personales on-chain

```bash
# 1. Ir a Scrollscan
https://sepolia.scrollscan.com/address/0x2B439F8B6F9afB05c7E9008Cc72EFa1C929d2bC2

# 2. Revisar las transacciones
# 3. Observar que solo hay:
#    - Hashes (bytes32)
#    - Scores (uint8)
#    - Timestamps
#    NO hay emails, nombres, ni user IDs
```

#### Test 2: Intentar revertir un hash

```typescript
// IMPOSIBLE: No se puede obtener datos originales
const hash = "0x8f7b3c2d1e9a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c";
// ❌ No existe función para obtener userId, emotion, etc.
```

#### Test 3: Verificar RLS en Supabase

```sql
-- Los usuarios SOLO pueden ver sus propios check-ins
SELECT * FROM check_ins WHERE user_id = auth.uid();

-- Los gerentes ven datos AGREGADOS, sin user_id visible
SELECT AVG(score), COUNT(*) FROM check_ins WHERE company_id = 'xxx';
```

---

### 8. Mejores Prácticas de Privacidad Implementadas

#### En el Frontend

1. **No loguear datos sensibles**
   ```typescript
   // ❌ MAL
   console.log('User:', user.email, user.name);

   // ✅ BIEN
   console.log('User logged in');
   ```

2. **Limpiar LocalStorage al logout**
   ```typescript
   const handleLogout = async () => {
     await supabase.auth.signOut();
     localStorage.clear(); // Limpiar todo
     sessionStorage.clear();
   };
   ```

3. **HTTPS obligatorio en producción**
   - Certificado SSL/TLS
   - Cookies con flag `secure`

#### En el Smart Contract

1. **Solo hashes, nunca datos en crudo**
   ```solidity
   // ✅ CORRECTO
   function registerCheckIn(bytes32 _hash, uint8 _score) { ... }

   // ❌ INCORRECTO (nunca hacer esto)
   function registerCheckIn(string memory _userId, string memory _email) { ... }
   ```

2. **Eventos sin datos sensibles**
   ```solidity
   // ✅ CORRECTO
   event CheckInRegistered(bytes32 indexed recordHash, uint256 timestamp, uint8 score);

   // ❌ INCORRECTO
   event CheckInRegistered(address indexed user, string email, uint8 score);
   ```

#### En la Base de Datos

1. **RLS en todas las tablas**
   ```sql
   ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view their own check-ins"
     ON check_ins FOR SELECT
     TO authenticated
     USING (user_id = auth.uid());
   ```

2. **Encriptación de datos sensibles**
   - Supabase encripta toda la BD en reposo
   - TLS 1.3 para datos en tránsito

---

### 9. Recursos para Aprender ZK

#### Tutoriales Recomendados
- [Zero-Knowledge Proofs for Beginners](https://zkp.science/)
- [ZK-SNARKS Under the Hood](https://vitalik.ca/general/2017/02/01/zk_snarks.html)
- [Scroll ZK Documentation](https://docs.scroll.io/en/technology/)
- [Aztec Protocol Docs](https://docs.aztec.network/)

#### Librerías ZK
- **SnarkJS**: Para generar y verificar ZK-SNARKs
- **Circom**: Lenguaje para escribir ZK circuits
- **zk-toolkit**: Suite completa para desarrollo ZK

#### Cursos Online
- [MIT: Zero-Knowledge Proofs](https://zkp.science/)
- [ZK Learning](https://zk-learning.org/)
- [Cryptography & Privacy MOOC](https://www.coursera.org/learn/crypto)

---

### 10. Conclusión

**TalentWell hoy:**
- ✅ Privacidad robusta mediante hashing anónimo
- ✅ Datos personales nunca on-chain
- ✅ Transparencia sin comprometer identidad
- ✅ Fundamento sólido para ZK futuro

**TalentWell mañana:**
- 🚀 Zero-Knowledge Proofs completos
- 🚀 Privacidad total con verificabilidad
- 🚀 Analytics sobre datos encriptados
- 🚀 Cumplimiento regulatorio máximo

La arquitectura actual de hashing + blockchain sienta las bases perfectas para evolucionar hacia un sistema ZK completo, permitiendo privacidad absoluta sin sacrificar verificabilidad.

---

## Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

## Soporte

Para preguntas, problemas o sugerencias, por favor abrir un issue en el repositorio.

**Desarrollado con tecnología blockchain para garantizar transparencia y privacidad en el bienestar laboral.**
