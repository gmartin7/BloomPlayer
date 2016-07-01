import {PageVisible, PageBeforeVisible, PageHidden} from "./navigation";

// The Carousel is one system for transitioning between pages.
// It transitions by sliding pages in and out, in approximation
// of page turning. So it is appropriate if the user would think
// of this as a book (as opposed to a video).
export default class Carousel {

    private pageBeingHidden: HTMLElement;

    public constructor(parent: HTMLElement) {
        parent.insertAdjacentHTML("afterbegin", "<div id='pages-carousel'></div>");
        const carousel = document.getElementById("pages-carousel");

        const pages = document.getElementsByClassName("bloom-page");

        //REVIEW: doesn't work. we want to do this so that we can
        // get it visible and determine the size of a page for setting the scale
        pages[0].classList.add("currentPage");

        for (let index = 0; index < pages.length; index++) {
            carousel.appendChild(pages[index]);
        }
    }

    //TODO better way to do this?
    public showFirstPage() {
        this.carousel().style.left = "0px";
    }

    public transitionPage(targetPage: HTMLElement, goForward: boolean): void {
        const current = this.currentPage();
        // Here we set a new 'left' or 'right' and will animate transition from 0 to that new value.
        // As soon as it is done, an 'transtionend' event will just hide that page completely
        // and reset the carousel's positioning to 'left:0' (regardless of whether we were manipulating
        // the 'left' (to go forward) or 'right' (to go backward)).
        this.carousel().style.transition = ""; // "left 1.5s ease 0s, right 1.5s ease 0s";

        const amount = Math.round(this.pageWidth());
        assertIsNumber(amount);

        if (goForward) {
            //For some reason, browsers won't do transition effects from "auto" to some pixel value,
            //so we first have to change from "auto" to "0"
            this.carousel().style.left = "0";

            //That needs to get registered before we then change it, so we defer the change
            window.setTimeout(() => {
                  this.carousel().style.transition = "left .5s";
                  this.carousel().style.left = (-1 * amount) + "px";
            }, 100);
        } else {
            //need to change our right so that
            this.carousel().style.left = (-1 * amount) + "px";
            window.setTimeout(() => {
                this.carousel().style.transition = "left .5s";
                this.carousel().style.left = "0px";
            }, 100);
        }

        this.pageBeingHidden = current;

        PageHidden.raise(current);

        //find the next one
        if (targetPage) {
            targetPage.classList.add("currentPage");
            PageBeforeVisible.raise(targetPage); // before the animation
        } else {
            // wrap around //TODO remove this when we can disable the "next button" on the last page
            this.showFirstPage();
        }

        window.setTimeout(() => {
                        this.pageBeingHidden.classList.remove("currentPage");
                        this.carousel().style.transition = "";
                        this.carousel().style.left = "0px";

                        if (targetPage) {
                            PageVisible.raise(targetPage);
                        }
        }, 500);
    }

    private carousel(): HTMLElement {
        return  document.getElementById("pages-carousel");
    }
    private  currentPage(): HTMLElement {
        return this.carousel().getElementsByClassName("currentPage")[0] as HTMLElement;
    }

    private  pageWidth(): number {
        return this.currentPage().scrollWidth;
    }
}

function assertIsNumber(n: number) {
    if ( !(typeof n === "number" && !isNaN(n))) {
        debugger;
    }
}
