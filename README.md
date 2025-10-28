# TalentWell - Plataforma de Bienestar Emocional con Blockchain

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

## Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

## Soporte

Para preguntas, problemas o sugerencias, por favor abrir un issue en el repositorio.

**Desarrollado con tecnología blockchain para garantizar transparencia y privacidad en el bienestar laboral.**
