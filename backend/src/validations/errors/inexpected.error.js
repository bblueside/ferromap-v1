export class InexpectedError extends Error {
    message = "Ocurrió un error inesperado, por favor intente nuevamente más tarde"
    constructor (message) {
    super(message)
    this.name = 'InexpectedError'
    }
}