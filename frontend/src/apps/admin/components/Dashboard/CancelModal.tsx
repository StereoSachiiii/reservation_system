
interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * @brief Modal component to confirm cancellation of a reservation/payment. Displays a confirmation message and options to proceed with cancellation or abort the action.
 * 
 * @param props 
 * @returns 
 */
const CancelModal = ({ isOpen, onClose }: CancelModalProps) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-black text-slate-900 mb-2">Cancel Action</h2>
        <p className="text-slate-500 font-medium leading-relaxed mb-8">
          Are you sure you want to cancel this payment? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            onClick={onClose}
          >
            No, keep it
          </button>
          <button
            className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancelModal
