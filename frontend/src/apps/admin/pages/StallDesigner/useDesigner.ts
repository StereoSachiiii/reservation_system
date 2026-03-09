import { useContext } from 'react';
import { DesignerContext } from './DesignerContext';

export const useDesigner = () => {
    const context = useContext(DesignerContext);
    if (!context) {
        throw new Error('useDesigner must be used within a DesignerProvider');
    }
    return context;
};
