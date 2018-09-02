import { Disposable } from '../drizzle';
import { DynamicNode } from './dynamic-node';
import { Module } from '../module';
import { View } from '../view';
import { Region, Renderable } from '../renderable';
export interface ComponentHook extends Disposable {
    update(...args: any[]): void;
}
export declare type Component = (node: Node, ...args: any[]) => ComponentHook;
export declare const components: {
    [name: string]: Component;
};
export declare type CustomHelper = (...args: any[]) => any;
export declare const helpers: {
    [name: string]: CustomHelper;
};
export declare type CustomEvent = (name: Node, cb: (event: any) => void) => Disposable;
export declare const customEvents: {
    [name: string]: CustomEvent;
};
export interface BindingGroup {
    type: 'checkbox' | 'radio';
    items: DynamicNode[];
    busy: boolean;
}
export interface Context {
    groups: {
        [name: string]: BindingGroup;
    };
    create(name: string, state?: object): Promise<Module | View>;
    helper(name: string): CustomHelper | undefined;
    component(name: string): Component | undefined;
    event(name: string): CustomEvent | undefined;
    ref(id: string, node?: HTMLElement | Renderable<any>): void;
    region(id: string, region: Region): void;
    delay(p: Promise<any>): void;
    end(): Promise<any>;
}
export interface DataContext extends Context {
    data: {
        [name: string]: any;
    };
    update(data: object): void;
    trigger(name: string, ...args: any[]): void;
    dispatch(name: string, ...args: any[]): void;
    sub(data: {
        [name: string]: any;
    }): DataContext;
}
declare abstract class AbstractDataContext implements DataContext {
    groups: {};
    data: {};
    busy: Promise<any>;
    root: Module | View;
    constructor(root: Module | View, data?: {
        [name: string]: any;
    }, groups?: {
        [name: string]: BindingGroup;
    }, busy?: Promise<any>);
    update(data: object): void;
    trigger(name: string, ...args: any[]): void;
    dispatch(name: string, ...args: any[]): void;
    ref(id: string, node?: HTMLElement | Renderable<any>): void;
    region(id: string, region: Region): void;
    delay(p: Promise<any>): void;
    end(): Promise<any>;
    event(name: string): CustomEvent | undefined;
    abstract sub(data: {
        [name: string]: any;
    }): DataContext;
    abstract create(name: string, state?: object): Promise<Module | View>;
    abstract helper(name: string): CustomHelper | undefined;
    abstract component(name: string): Component | undefined;
}
export declare class ViewDataContext extends AbstractDataContext {
    sub(data: {
        [name: string]: any;
    }): DataContext;
    create(name: string, state?: object): Promise<Module | View>;
    helper(name: string): CustomHelper | undefined;
    component(name: string): Component | undefined;
}
export declare class ModuleDataContext extends AbstractDataContext {
    sub(data: {
        [name: string]: any;
    }): DataContext;
    create(name: string, state?: object): Promise<Module | View>;
    helper(name: string): CustomHelper | undefined;
    component(name: string): Component | undefined;
}
export {};
