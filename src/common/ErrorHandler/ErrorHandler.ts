export default interface ErrorHandler {
  handle(error: any, event?: any): any;
}
