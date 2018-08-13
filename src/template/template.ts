import { Disposable } from '../drizzle'
import { Node as MNode } from './node'
import { Renderable } from '../renderable'
import { Lifecycle } from '../lifecycle'

type StaticValue = string | number | boolean
type DynamicValue = string

export enum ValueType { STATIC, DYNAMIC }
export enum ChangeType { CHANGED, NOT_CHANGED }

export type AttributeValue = [ValueType.STATIC, StaticValue] | [ValueType.DYNAMIC, DynamicValue]
export type Attribute = [string, AttributeValue]

export type HelperResult = [ChangeType, any]

export interface Updatable extends Disposable {
    update (context: object): void
}

export interface Appendable {
    append (el: Node)
    remove (el: Node)
    before (anchor: Node): Appendable
}

export function createAppendable (target: Node): Appendable {
    const remove = (el: Node) => target.removeChild(el)
    const append = (el: Node) => target.appendChild(el)
    const before = (anchor: Node) => {
        return {remove, before, append: (el: Node) => target.insertBefore(el, anchor)}
    }
    return {append, remove, before}
}

export class Delay {
    static also (fn: (Delay) => void) {
        const d = new Delay()
        fn(d)
        return d.execute()
    }

    delays: Promise<any>[] = []

    add (p: Promise<any>) {
        this.delays.push(p)
    }

    execute () {
        return Promise.all(this.delays)
    }
}

export function getValue (key: string, context: any): any {
    const ks = key.split('.')
    const first = ks.shift()
    let ctx
    if (context._computed && first in context._computed) {
        ctx = context._computed[first](context)
    } else {
        ctx = context[first]
    }

    if (ks.length) {
        ctx = ks.reduce((acc, item) => {
            if (acc == null) return null
            return acc[item]
        }, ctx)
    }

    return ctx
}

export function getAttributeValue(attr: AttributeValue, context: object): any {
    if (attr[0] === ValueType.STATIC) return attr[1]
    return getValue(attr[1] as string, context)
}

export function resolveEventArgument (me: any, context: object, args: Attribute[], event: any): any[] {
    const values = args.map(([name, v]) => {
        if (v[0] === ValueType.STATIC) return v[1]
        const it = v[1] as string
        if (it === 'event') return event
        if (it === 'this') return me
        if (it.slice(0, 6) === 'event.') return event[it.slice(6)]
        if (it.slice(0, 5) === 'this.') return me[it.slice(5)]
        return getValue(it, context)
    })

    const obj = {}
    const result = [obj]
    let keys = 0

    args.forEach(([name, v], i) => {
        if (name) {
            keys ++
            obj[name] = values[i]
            return
        }
        result.push(values[i])
    })

    if (keys === 0) result.shift()
    return result
}

export const customEvents = {
    enter (node: HTMLElement, cb: (any) => void): Disposable {
        const ee = function (this: HTMLElement, e) {
            if (e.keyCode !== 13) return
            e.preventDefault()
            cb.call(this, e)
        }
        node.addEventListener('keypress', ee, false)
        return {
            dispose () {
                node.removeEventListener('keypress', ee, false)
            }
        }
    },

    escape (node: HTMLElement, cb: (any) => void): Disposable {
        const ee = function (this: HTMLElement, e) {
            if (e.keyCode !== 27) return
            cb.call(this, e)
        }
        node.addEventListener('keyup', ee, false)
        return {
            dispose () {
                node.removeEventListener('keyup', ee, false)
            }
        }
    }
}

export abstract class Template<T extends Renderable<any>> {
    life: Lifecycle
    nodes: MNode[]
    root: T

    init (root: T, delay: Delay) {
        this.root = root
        this.nodes.forEach(it => it.init(root, delay))
    }

    render (context: object, delay: Delay) {
        this.nodes.forEach(it => {
            it.parent = this.root._target
            it.render(context, delay)
        })
    }

    update (context: object, delay: Delay) {
        this.nodes.forEach(it => it.update(context, delay))
    }

    destroy (delay: Delay) {
        this.nodes.forEach(it => {
            it.destroy(delay)
            it.parent = null
        })
    }
}
