import { DataContext } from './context'
import { getValue, getAttributeValue } from './value'
import { EachState, NormalValue } from './common'

export class Transformer {
    value: string
    end: NormalValue
    items: TransformerItem[]

    constructor (value: string, items: TransformerItem[], end?: NormalValue) {
        this.value = value
        this.items = items || []
        this.end = end
    }

    get (dc: DataContext, state: EachState): any {
        let v = getValue(dc, this.value, state)
        v = this.items.reduce((acc, item) => item.get(dc, state, acc), v)
        if (v == null && this.end) {
            return getAttributeValue(dc, this.end, state)
        }
        return v
    }
}

export class TransformerItem {
    name: string
    args: NormalValue[]

    constructor(name: string, args: NormalValue[]) {
        this.name = name
        this.args = args || []
    }

    get (dc: DataContext, state: EachState, v: any): any {
        const fn = dc.transformer(this.name)
        if (!fn) {
            throw new Error(`no helper found: ${this.name}`)
        }
        const args = this.args.map(it => getAttributeValue(dc, it, state)).concat(v)
        return fn.apply(null, args)
    }
}