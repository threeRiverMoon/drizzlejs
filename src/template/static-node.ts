import { Node } from './node'
import { Delay } from './template'
import { setAttribute } from './attributes'

export class StaticNode extends Node {
    name: string
    attributes: [string, string][]

    constructor(name: string, attributes: [string, string][] = [], id?: string) {
        super(id)
        this.name = name
        this.attributes = attributes
        if (name === 'svg') this.inSvg = true
    }

    render (context: object, delay: Delay) {
        if (this.rendered) return
        this.rendered = true

        super.render(context, delay)
        this.parent.append(this.element)
        this.children.forEach(it => it.render(context, delay))
    }

    update (context: object, delay: Delay) {
        this.children.forEach(it => it.update(context, delay))
    }

    destroy (delay: Delay) {
        if (!this.rendered) return
        super.destroy(delay)

        this.parent.remove(this.element)
        this.rendered = false
    }

    create () {
        const element = this.inSvg ?
            document.createElementNS('http://www.w3.org/2000/svg', this.name) :
            document.createElement(this.name)
        this.attributes.forEach(it =>  setAttribute(element, it[0], it[1]))
        return element
    }
}
