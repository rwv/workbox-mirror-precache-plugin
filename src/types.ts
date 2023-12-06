export interface PrecacheEntry {
    integrity?: string;
    url: string;
    revision?: string | null;
}

export type ExtendableEvent = Event;
export interface MapLikeObject {
    [key: string]: any;
}
export type PluginState = MapLikeObject;
export interface HandlerWillStartCallbackParam {
    request: Request;
    event: ExtendableEvent;
    state?: PluginState;
}
export interface HandlerWillStartCallback {
    (param: HandlerWillStartCallbackParam): Promise<void | null | undefined>;
}

export interface WorkboxPlugin {
    handlerWillStart?: HandlerWillStartCallback;
}