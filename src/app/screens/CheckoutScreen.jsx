import CheckoutForm from '../../components/CheckoutForm.jsx'
import { useAppNav } from '../nav.jsx'

/**
 * Mobile checkout screen. All the form lives in the shared CheckoutForm so the
 * storefront's checkout modal can render exactly the same fields and rules.
 */
export default function CheckoutScreen() {
  const nav = useAppNav()

  return (
    <CheckoutForm
      variant="page"
      onDone={(action) => nav.go(action === 'account' ? 'account' : 'home')}
    />
  )
}
