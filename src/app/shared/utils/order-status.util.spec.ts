import {OrderStatusUtil} from "./order-status.util";

describe('Order status util', () => {
    it('should return name and status with no status', () => {
        const result: any = OrderStatusUtil.getStatusAndColor(undefined)
        expect(result.name).not.toBe('')
        expect(result.color).not.toBe('')
        expect(result).toEqual({name: 'Новый', color: '#456F49'})
        expect(result).toBeInstanceOf(Object)
        expect(result.test).toBeUndefined()
    })

    it('should return name and status with wrong status', () => {
        const result = OrderStatusUtil.getStatusAndColor('undefined')
        expect(result.name).toBe('Новый')
        expect(result.color).toBe('#456F49')
        expect(result).toEqual({name: 'Новый', color: '#456F49'})
    })
})
