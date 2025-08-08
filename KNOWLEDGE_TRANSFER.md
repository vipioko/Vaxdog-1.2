# VaxDog - Knowledge Transfer Document

## Project Overview
VaxDog is a dog vaccination management system built with React, TypeScript, Tailwind CSS, and Firebase. It allows users to manage their dogs' vaccination schedules and book home visits, with separate admin functionality for managing products and bookings.

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI components
- **Backend**: Firebase (Firestore, Auth, Storage)
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI (via Shadcn/UI)
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure

### Core Files
```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── providers/          # Context providers
├── data/               # Type definitions and mock data
├── lib/                # Utility functions
└── firebase.ts         # Firebase configuration
```

## Authentication System

### AuthProvider (`src/providers/AuthProvider.tsx`)
**Purpose**: Manages user authentication state and admin permissions

**Key Functions**:
- `AuthProvider`: Context provider component
- `useAuth`: Hook to access auth context

**State Management**:
- `user`: Current Firebase user object
- `loading`: Authentication loading state
- `isAdmin`: Boolean flag for admin permissions

**Admin Check Logic**:
- Checks if user's phone number exists in `admins` collection
- Updates `isAdmin` state accordingly

### Authentication Flow
1. Firebase Auth state listener in `AuthProvider`
2. On user login, checks admin status via Firestore
3. Routes user to appropriate dashboard (admin/user)

## Routing System (`src/App.tsx`)

### Route Structure
- **Public Routes**: `/` (landing page)
- **User Routes**: `/dashboard`, `/my-dogs`, `/my-dogs/:dogName`, `/profile`
- **Admin Routes**: `/admin`

### Route Protection
- Unauthenticated users: Redirected to landing page
- Authenticated users: Redirected based on admin status
- Admin users: Access only to admin routes
- Regular users: Access only to user routes

## User Management System

### Dogs Management (`src/pages/MyDogs.tsx`)
**Purpose**: CRUD operations for user's dogs

**Key Features**:
- Add new dogs with image upload
- Edit existing dogs
- Delete dogs (with cascade delete of reminders)
- Visual status indicators (overdue, due-soon, booked)

**State Management**:
- Uses `useDogs` hook for data fetching
- Mutation functions for CRUD operations

**Visual Indicators**:
- **Red glow**: Overdue vaccinations
- **Yellow glow**: Due soon vaccinations  
- **Green glow**: Booked appointments
- **No glow**: No urgent reminders or all booked

### Dog Profile (`src/pages/DogProfile.tsx`)
**Purpose**: Detailed view of individual dog with vaccination schedule

**Components Used**:
- `UpcomingReminders`: Shows pending vaccinations
- `CompletedReminders`: Shows vaccination history
- `AddReminderDialog`: Add new vaccination reminders

## Vaccination Reminder System

### Data Model (Reminder)
```typescript
interface Reminder {
  id: string;
  dog: string;
  vaccine: string;
  due: string; // formatted date
  status: 'upcoming' | 'completed';
  completedDate?: string;
}
```

### Reminders Hook (`src/hooks/useReminders.ts`)
**Purpose**: Manages vaccination reminders CRUD operations

**Key Functions**:
- `addReminder`: Creates new vaccination reminder
- `markReminderAsComplete`: Updates reminder status to completed
- `deleteReminder`: Removes reminder
- `editReminder`: Updates reminder details

**Query Strategy**:
- Filters by dog name when provided
- Sorts by due date
- Real-time updates via React Query

### Reminder Components

#### UpcomingReminders (`src/components/reminders/UpcomingReminders.tsx`)
**Purpose**: Displays pending vaccinations with visual priority indicators

**Features**:
- Priority sorting (booked → overdue → due soon → normal)
- Color-coded status indicators
- Dropdown actions (mark complete, edit, delete)
- Integration with booking system

#### CompletedReminders (`src/components/reminders/CompletedReminders.tsx`)
**Purpose**: Shows vaccination history

## Booking System

### Transaction Management (`src/hooks/useTransactions.ts`)
**Purpose**: Manages booking transactions and payment records

**Data Model**:
```typescript
interface Transaction {
  id: string;
  reminderId: string;
  status: 'successful' | 'failed' | 'pending';
  amount: number;
  // ... other payment details
}
```

### Booking Flow
1. User selects vaccine from reminder
2. Opens `BookingFormDialog`
3. Multi-step process:
   - Slot selection
   - Contact information
   - Vaccine selection with pricing
   - Confirmation and payment

### Booking Status Logic
- Reminders with successful transactions show "Home visit booked"
- Booked reminders display at top with green styling
- Booked reminders don't show urgency indicators

## Product Management (Admin)

### Products Hook (`src/hooks/useProducts.ts`)
**Purpose**: Manages vaccine products catalog

**Data Model**:
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
}
```

### ProductManagement Component (`src/components/admin/ProductManagement.tsx`)
**Purpose**: Admin interface for managing vaccine products

**Features**:
- View all products in table format
- Add new products
- Edit existing products
- Delete products
- Real-time updates

**Integration**:
- Products populate dropdown in booking form
- Prices automatically calculated during booking

## UI Component System

### Design System
- **Primary Colors**: Custom theme with CSS variables
- **Animations**: Fade-in, glow effects, hover transitions
- **Responsive**: Mobile-first design with Tailwind breakpoints

### Key UI Components

#### DogCard (`src/components/DogCard.tsx`)
**Purpose**: Displays dog information with status indicators

**Features**:
- Image or avatar fallback
- Reminder status visualization
- Action dropdown (edit/delete)
- Click navigation to dog profile

#### Layout Components
- `Layout`: Main user layout with bottom navigation
- `AdminLayout`: Admin layout with header and logout
- `BottomNav`: Mobile-optimized navigation

### Animation System
**Glow Animation** (`tailwind.config.ts`):
- Duration: 4 seconds for slow pulse effect
- Used for urgent reminders and status indicators
- Configurable colors via CSS variables

## Data Flow Architecture

### State Management Strategy
1. **Server State**: TanStack React Query for API data
2. **Local State**: React hooks for component state
3. **Global State**: React Context for authentication

### Data Fetching Pattern
```typescript
// Standard hook pattern
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', userId],
  queryFn: fetchFunction,
  enabled: !!userId
});
```

### Mutation Pattern
```typescript
const mutation = useMutation({
  mutationFn: updateFunction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource'] });
    toast.success('Success message');
  },
  onError: (error) => {
    toast.error(error.message);
  }
});
```

## Firebase Integration

### Configuration (`src/firebase.ts`)
- Firestore database
- Authentication
- Cloud Storage for images

### Database Structure
```
users/{userId}/
├── dogs/{dogId}
├── reminders/{reminderId}
└── transactions/{transactionId}

products/{productId}
admins/{phoneNumber}
```

### Security Rules
- Users can only access their own data
- Admins collection readable by authenticated users
- Products collection readable by all authenticated users

## Error Handling Strategy

### Client-Side Error Handling
- Toast notifications for user feedback
- Loading states for async operations
- Form validation with Zod schemas
- Graceful fallbacks for missing data

### Network Error Handling
- React Query handles retries and caching
- Offline capability through query cache
- Error boundaries for component crashes

## Performance Optimizations

### Image Handling
- Lazy loading with `loading="eager"` for critical images
- Image optimization through Firebase Storage
- Avatar fallbacks for missing images

### Query Optimization
- Strategic use of `enabled` option
- Proper cache invalidation
- Selective data fetching

### Code Splitting
- Route-based code splitting
- Lazy loading of heavy components
- Tree shaking through ES modules

## Development Workflow

### Build Process
- Vite for fast development and building
- TypeScript for type safety
- ESLint for code quality

### File Naming Conventions
- PascalCase for components
- camelCase for hooks and utilities
- kebab-case for file names where appropriate

## Deployment Considerations

### Environment Variables
- Firebase configuration
- Stripe keys (if payment integration added)

### Build Configuration
- Vite production optimizations
- Asset optimization
- Bundle analysis

## Testing Strategy (Recommended)

### Unit Testing
- Component testing with React Testing Library
- Hook testing with testing utilities
- Utility function testing

### Integration Testing
- User flow testing
- Firebase integration testing
- Form submission testing

## Security Considerations

### Authentication Security
- Firebase Auth handles secure authentication
- Admin role verification server-side
- Protected routes implementation

### Data Security
- Firestore security rules
- User data isolation
- Input validation and sanitization

## Common Issues and Solutions

### Build Issues
- Missing imports: Check all component imports
- TypeScript errors: Ensure proper type definitions
- Route conflicts: Verify route configuration

### Runtime Issues
- Authentication state: Check Firebase configuration
- Data loading: Verify query dependencies
- Image loading: Check storage permissions

## Future Enhancement Opportunities

### Technical Improvements
- Add comprehensive error boundaries
- Implement service worker for offline support
- Add automated testing suite
- Optimize bundle size

### Feature Enhancements
- Push notifications for reminders
- Email notifications
- Advanced reporting for admins
- Multi-language support

## Handover Checklist

### Development Setup
- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Configure Firebase project
- [ ] Set up environment variables
- [ ] Run development server (`npm run dev`)

### Access Requirements
- [ ] Firebase project access
- [ ] Admin account for testing
- [ ] Understanding of component architecture
- [ ] Familiarity with React Query patterns

### Key Files to Understand First
1. `src/App.tsx` - Application structure
2. `src/providers/AuthProvider.tsx` - Authentication logic
3. `src/pages/MyDogs.tsx` - Main user functionality
4. `src/hooks/useReminders.ts` - Core business logic
5. `src/components/reminders/UpcomingReminders.tsx` - Status display logic

This document provides a comprehensive overview of the VaxDog project. For specific implementation details, refer to the individual component files and their inline documentation.
