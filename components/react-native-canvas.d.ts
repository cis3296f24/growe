declare module 'react-native-canvas' {
    import { Component } from 'react';
    import { ViewProps } from 'react-native';

    export class Canvas extends Component<ViewProps> {
        getContext(contextType: string): any;
        toDataURL(type?: string, encoderOptions?: number): Promise<string>;
    }
    export class Image extends Component<ViewProps> {}
}
declare module "react-native-canvas" {
    export default class Canvas extends React.Component<any> {
        getContext(contextType: string): CanvasRenderingContext2D;
        toDataURL(): Promise<string>;
        width: number;
        height: number;
    }
}
