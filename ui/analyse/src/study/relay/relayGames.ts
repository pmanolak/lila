import type { StudyCtrl } from '../studyDeps';
import type RelayCtrl from './relayCtrl';
import { userTitle } from 'lib/view/userLink';
import { defined, scrollToInnerSelector } from 'lib';
import { renderClock, verticalEvalGauge } from '../multiBoard';
import type { ChapterPreview } from '../interfaces';
import { gameLinkAttrs } from '../studyChapters';
import { playerFed } from '../playerBars';
import { h } from 'snabbdom';
import { resultTag } from '../studyView';

export const gamesList = (study: StudyCtrl, relay: RelayCtrl) => {
  const chapters = study.chapters.list.all();
  const cloudEval = study.multiCloudEval?.thisIfShowEval();
  const roundPath = relay.roundPath();
  const showResults = study.multiBoard.showResults();
  return h(
    'div.relay-games',
    {
      class: { 'relay-games__eval': defined(cloudEval) },
      hook: {
        postpatch(old, vnode) {
          const currentId = study.data.chapter.id;
          if (old.data!.current !== currentId)
            scrollToInnerSelector(vnode.elm as HTMLElement, '.relay-game--current');
          vnode.data!.current = currentId;
        },
      },
    },
    chapters.length === 1 && chapters[0].name === 'Chapter 1'
      ? []
      : chapters.map((c, i) => {
          const status =
            !c.status || c.status === '*' ? renderClocks(c) : [c.status.slice(2, 3), c.status.slice(0, 1)];
          const players = [c.players?.black, c.players?.white];
          if (c.orientation === 'black') {
            players.reverse();
            status.reverse();
          }
          return h(
            `a.relay-game.relay-game--${c.id}`,
            {
              attrs: {
                ...gameLinkAttrs(roundPath, c),
                'data-n': i + 1,
              },
              class: { 'relay-game--current': c.id === study.data.chapter.id },
            },
            [
              showResults ? cloudEval && verticalEvalGauge(c, cloudEval) : undefined,
              h(
                'span.relay-game__players',
                players.map((p, i) => {
                  const s = status[i];
                  return h(
                    'span.relay-game__player',
                    p
                      ? [
                          h('span.mini-game__user', [
                            playerFed(p.fed),
                            h('span.name', [userTitle(p), p.name]),
                          ]),
                          showResults ? h(resultTag(s), [s]) : null,
                        ]
                      : [h('span.mini-game__user', h('span.name', 'Unknown player'))],
                  );
                }),
              ),
            ],
          );
        }),
  );
};

const renderClocks = (chapter: ChapterPreview) =>
  ['black', 'white'].map((color: Color) => renderClock(chapter, color));
