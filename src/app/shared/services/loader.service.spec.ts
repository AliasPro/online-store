import {LoaderService} from "./loader.service";

describe('Loader Service', () => {
    let loaderService: LoaderService

    beforeEach(() => {
        loaderService = new LoaderService()
    })

    it('Loader show', (done: DoneFn) => {
        loaderService.isShowed$.subscribe(value => {
            expect(value).toBeTrue()
            done()
        })

        loaderService.show()
    })

})
