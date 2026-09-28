import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mouvementSobre } from "./recalageScroll";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Entrée d'une carte : le cadre se dévoile depuis le haut pendant que l'image
// revient de son zoom, puis le texte monte.
//
// Le sens du dévoilement n'est pas décoratif. Une carte fait 620 px : quand
// elle entre par le bas de l'écran, le premier bord qu'on voit est son bord
// HAUT. Le clip partait de `inset(100% 0 0 0)`, c'est-à-dire du bas — le haut
// de la carte était donc la dernière zone servie, alors que c'est la seule
// qu'on regarde à cet instant. On voyait un cadre vide monter et il fallait
// descendre de la hauteur d'une carte avant que l'image arrive : l'entrée
// paraissait en retard alors qu'elle avait bien démarré. En dévoilant du haut
// vers le bas, le trait suit le sens de lecture du défilement.
// Chaque carte s'anime elle-même : les cartes ajoutées par « charger la suite »
// n'obligent à recalculer aucun déclencheur.
export function useCardEnter(delay = 0) {
    const scopeRef = useRef(null);

    useGSAP(() => {
        const el = scopeRef.current;
        if (!el) return;

        // Qui demande la sobriété reçoit la carte, telle quelle. Sans ce
        // garde-fou la carte partait quand même de son état masqué : le seul
        // moyen de la voir aurait été de jouer l'animation qu'on refuse.
        if (mouvementSobre()) return;

        const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            delay,
            scrollTrigger: {
                trigger: el,
                // Le seuil se mesure sur la carte, pas sur l'ecran.
                //
                // C'est la correction qui manquait aux essais precedents. Un
                // offset en pixels fixes (140) ou en pourcentage de fenetre
                // (85 %) decrit la position de l'ecran ; or ce qu'on veut
                // decrire, c'est la carte : « elle part quand elle est a
                // moitie entree ». Comme elle fait 620 px, un seuil de 140 px
                // la faisait demarrer alors qu'il n'y avait presque rien a
                // voir — l'entree se consommait hors champ et on arrivait
                // apres. La moitie de sa propre hauteur place le depart la ou
                // le regard est deja pose.
                //
                // Fonction et non chaine figee : ScrollTrigger la rappelle a
                // chaque refresh, donc le seuil suit la carte si sa hauteur
                // change (media queries, CARD_HEIGHT retouche).
                start: () => `top bottom-=${el.offsetHeight * 0.5}`,
                once: true,
            },
            // Une entree ne se joue qu'une fois : des qu'elle est jouee, on
            // retire le declencheur au lieu de le laisser en place.
            //
            // Ce n'est pas du menage, c'est ce qui rend la carte inviolable.
            // Un ScrollTrigger vivant se laisse rembobiner par n'importe quel
            // ScrollTrigger.refresh() declenche ailleurs dans l'application ;
            // si le refresh tombe pendant que le defilement de fond est bloque
            // (l'ouverture du panneau circuit), la carte est relue comme « pas
            // encore atteinte » et repart a son etat de depart —
            // `clip-path: inset(0 0 100% 0)`, donc invisible. Et comme `once`
            // interdit un second passage, elle ne revient jamais.
            //
            // Le declencheur mort, la carte garde ses styles de fin : plus rien
            // ne peut la faire disparaitre.
            onComplete: () => tl.scrollTrigger?.kill(),
        });

        // Trois `fromTo`, et pas un seul `from` : c'est ce qui manquait.
        //
        // Un `from` ne connaît pas sa destination, il la RELÈVE sur l'élément
        // au moment de sa création. Tant qu'on n'y revient pas, très bien.
        // Mais un recalage — et la page en déclenche à chaque image qui
        // arrive — peut faire relire ces valeurs, et il les relit alors que
        // l'élément est posé sur son état de DÉPART, celui que le `from` a
        // appliqué d'office. La destination enregistrée devient « opacité 0 » :
        // le texte s'anime de l'invisible vers l'invisible, et la carte reste
        // à moitié vide sans que rien ne paraisse cassé. `fromTo` écrit les
        // deux bouts noir sur blanc — aucun recalage ne peut les réinventer.
        //
        // `invalidateOnRefresh` a disparu pour la même raison : il ORDONNAIT
        // cette relecture. Le seuil, lui, est une fonction — il est réévalué à
        // chaque recalage sans avoir besoin de toucher aux valeurs.
        tl.fromTo("[data-card-media]",
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05 }
        )
            .fromTo("[data-card-img]", { scale: 1.22 }, { scale: 1, duration: 1.45 }, 0)
            .fromTo("[data-card-text]",
                { yPercent: 40, opacity: 0 },
                { yPercent: 0, opacity: 1, duration: 0.85 }, 0.3);
    }, { scope: scopeRef, dependencies: [delay] });

    return scopeRef;
}
