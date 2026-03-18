import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateOrder } from '../../hooks/useOrders';
import { PRODUCTS, COUNTRIES, STATUSES, CREATED_BY, PRODUCT_PRICES } from '../../utils/validators';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';

const orderSchema = z.object({
  first_name: z.string().min(1, 'Please fill the field'),
  last_name: z.string().min(1, 'Please fill the field'),
  email: z.string().min(1, 'Please fill the field').email('Invalid email format'),
  phone_number: z.string().min(1, 'Please fill the field'),
  street_address: z.string().min(1, 'Please fill the field'),
  city: z.string().min(1, 'Please fill the field'),
  state_province: z.string().min(1, 'Please fill the field'),
  postal_code: z.string().min(1, 'Please fill the field'),
  country: z.string().min(1, 'Please fill the field'),
  product: z.string().min(1, 'Please fill the field'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().positive('Unit price must be positive'),
  status: z.string().min(1, 'Please fill the field'),
  created_by: z.string().min(1, 'Please fill the field'),
});

export default function CreateOrderModal({ onClose }) {
  const createOrder = useCreateOrder();
  const { isDarkMode } = useThemeStore();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 1,
      unit_price: 0,
      status: 'Pending',
    },
    mode: 'onBlur',
  });

  const quantity = watch('quantity');
  const unitPrice = watch('unit_price');
  const product = watch('product');
  const totalAmount = (quantity || 0) * (unitPrice || 0);

  useEffect(() => {
    if (product && PRODUCT_PRICES[product]) {
      setValue('unit_price', PRODUCT_PRICES[product]);
    }
  }, [product, setValue]);

  const onSubmit = (data) => {
    createOrder.mutate(data, {
      onSuccess: () => onClose(),
    });
  };

  const inputClass = (field) =>
    cn(
      'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition',
      errors[field]
        ? isDarkMode ? 'border-red-500/50 bg-red-900/20 text-gray-200' : 'border-red-300 bg-red-50'
        : isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder:text-gray-500' : 'border-gray-200'
    );

  const labelClass = cn('block text-sm font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-600');
  const sectionTitleClass = cn('text-sm font-semibold mb-4 uppercase tracking-wider', isDarkMode ? 'text-gray-400' : 'text-gray-700');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto",
        isDarkMode ? "bg-gray-800" : "bg-white"
      )}>
        <div className={cn(
          "sticky top-0 px-6 py-4 flex items-center justify-between rounded-t-xl z-10",
          isDarkMode ? "bg-gray-800 border-b border-gray-700" : "bg-white border-b border-gray-100"
        )}>
          <h2 className={cn("text-lg font-semibold", isDarkMode ? "text-gray-200" : "text-gray-800")}>Create Order</h2>
          <button onClick={onClose} className={cn("transition", isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600")} id="create-order-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className={sectionTitleClass}>Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First name *</label>
                <input {...register('first_name')} className={inputClass('first_name')} placeholder="John" id="order-first-name" />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Last name *</label>
                <input {...register('last_name')} className={inputClass('last_name')} placeholder="Doe" id="order-last-name" />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input {...register('email')} type="email" className={inputClass('email')} placeholder="john@example.com" id="order-email" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Phone number *</label>
                <input {...register('phone_number')} className={inputClass('phone_number')} placeholder="+1-555-555-5555" id="order-phone" />
                {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Street Address *</label>
                <input {...register('street_address')} className={inputClass('street_address')} placeholder="123 Main St" id="order-street" />
                {errors.street_address && <p className="text-xs text-red-500 mt-1">{errors.street_address.message}</p>}
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input {...register('city')} className={inputClass('city')} placeholder="New York" id="order-city" />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className={labelClass}>State / Province *</label>
                <input {...register('state_province')} className={inputClass('state_province')} placeholder="NY" id="order-state" />
                {errors.state_province && <p className="text-xs text-red-500 mt-1">{errors.state_province.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Postal code *</label>
                <input {...register('postal_code')} className={inputClass('postal_code')} placeholder="10001" id="order-postal" />
                {errors.postal_code && <p className="text-xs text-red-500 mt-1">{errors.postal_code.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Country *</label>
                <select {...register('country')} className={inputClass('country')} id="order-country">
                  <option value="">Select country...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>}
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div>
            <h3 className={sectionTitleClass}>Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Choose product *</label>
                <select {...register('product')} className={inputClass('product')} id="order-product">
                  <option value="">Select product...</option>
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Quantity *</label>
                <input
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  min="1"
                  className={inputClass('quantity')}
                  id="order-quantity"
                />
                {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Unit price *</label>
                <div className="relative">
                  <span className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-sm", isDarkMode ? "text-gray-500" : "text-gray-400")}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register('unit_price', { valueAsNumber: true })}
                    className={cn(inputClass('unit_price'), 'pl-7')}
                    id="order-unit-price"
                  />
                </div>
                {errors.unit_price && <p className="text-xs text-red-500 mt-1">{errors.unit_price.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Total amount</label>
                <div className={cn(
                  "px-3 py-2 text-sm border rounded-lg font-medium",
                  isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-700"
                )}>
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
              <div>
                <label className={labelClass}>Status *</label>
                <select {...register('status')} className={inputClass('status')} id="order-status">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Created by *</label>
                <select {...register('created_by')} className={inputClass('created_by')} id="order-created-by">
                  <option value="">Select person...</option>
                  {CREATED_BY.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.created_by && <p className="text-xs text-red-500 mt-1">{errors.created_by.message}</p>}
              </div>
            </div>
          </div>

          <div className={cn("flex justify-end gap-3 pt-4", isDarkMode ? "border-t border-gray-700" : "border-t border-gray-100")}>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition",
                isDarkMode ? "text-gray-300 bg-gray-700 hover:bg-gray-600" : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createOrder.isPending}
              className="px-6 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-2"
              id="create-order-submit"
            >
              {createOrder.isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
