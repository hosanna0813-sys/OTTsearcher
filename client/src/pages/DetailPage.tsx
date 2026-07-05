import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProviderSection from '../components/ProviderSection';
import StatusMessage from '../components/StatusMessage';
import { getMediaDetail, imageUrl } from '../services/api';
import { MediaDetail, MediaType } from '../types';

type Status = 'loading' | 'success' | 'error';

/** 詳細頁：/movie/:id、/tv/:id */
export default function DetailPage({ mediaType }: { mediaType: MediaType }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setStatus('loading');
    setDetail(null);
    window.scrollTo(0, 0);

    getMediaDetail(mediaType, id, controller.signal)
      .then((data) => {
        setDetail(data);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, [mediaType, id]);

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-3xl pb-16">
      <header className="sticky top-0 z-10 bg-gray-50/95 px-4 py-3 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          className="min-h-[44px] rounded-xl px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          ← 返回
        </button>
      </header>

      {status === 'loading' && <DetailSkeleton />}
      {status === 'error' && (
        <div className="px-4">
          <StatusMessage type="error" />
          <p className="text-center">
            <Link to="/" className="text-sm text-gray-500 underline">
              回到首頁
            </Link>
          </p>
        </div>
      )}
      {status === 'success' && detail && <DetailContent detail={detail} />}
    </main>
  );
}

function DetailContent({ detail }: { detail: MediaDetail }) {
  const poster = imageUrl.poster(detail.posterPath);
  const backdrop = imageUrl.backdrop(detail.backdropPath);
  const showOriginalTitle = detail.originalTitle && detail.originalTitle !== detail.title;

  const facts: string[] = [
    detail.year || '',
    detail.mediaType === 'movie' ? '電影' : '影集',
    detail.mediaType === 'movie' && detail.runtime ? `${detail.runtime} 分鐘` : '',
    detail.mediaType === 'tv' && detail.numberOfSeasons
      ? `${detail.numberOfSeasons} 季・${detail.numberOfEpisodes ?? '?'} 集`
      : '',
  ].filter(Boolean);

  return (
    <article>
      {backdrop && (
        <img
          src={backdrop}
          alt=""
          loading="lazy"
          className="h-44 w-full object-cover opacity-90 sm:h-64"
        />
      )}

      <div className="px-4 sm:px-6">
        {/* 基本資訊 */}
        <section className="-mt-12 flex items-end gap-4">
          {poster ? (
            <img
              src={poster}
              alt={detail.title}
              className="w-28 shrink-0 rounded-xl shadow-lg sm:w-36"
            />
          ) : (
            <div className="flex aspect-[2/3] w-28 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-4xl shadow-lg sm:w-36">
              🎬
            </div>
          )}
          <div className="min-w-0 pb-1">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{detail.title}</h1>
            {showOriginalTitle && <p className="mt-1 text-sm text-gray-500">{detail.originalTitle}</p>}
          </div>
        </section>

        <section className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
          <span>{facts.join('・')}</span>
          {detail.voteAverage > 0 && (
            <span className="font-medium text-gray-900">★ {detail.voteAverage.toFixed(1)}</span>
          )}
        </section>

        {detail.genres.length > 0 && (
          <section className="mt-3 flex flex-wrap gap-2">
            {detail.genres.map((g) => (
              <span key={g} className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-700">
                {g}
              </span>
            ))}
          </section>
        )}

        {/* 台灣 OTT 平台 */}
        <Section title="在台灣哪裡看">
          <ProviderSection watch={detail.watch} title={detail.title} />
        </Section>

        {/* 劇情 */}
        {detail.overview && (
          <Section title="劇情介紹">
            <p className="leading-relaxed text-gray-700">{detail.overview}</p>
          </Section>
        )}

        {/* 導演／創作者 */}
        {detail.directors.length > 0 && (
          <Section title={detail.mediaType === 'movie' ? '導演' : '創作者'}>
            <p className="text-gray-700">{detail.directors.join('、')}</p>
          </Section>
        )}

        {/* 主要演員 */}
        {detail.cast.length > 0 && (
          <Section title="主要演員">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              {detail.cast.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  {imageUrl.profile(c.profilePath) ? (
                    <img
                      src={imageUrl.profile(c.profilePath)!}
                      alt={c.name}
                      loading="lazy"
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                      👤
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-gray-900">{c.name}</span>
                    {c.character && (
                      <span className="block truncate text-xs text-gray-500">{c.character}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* 預告片 */}
        {detail.trailerKey && (
          <Section title="預告片">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${detail.trailerKey}`}
                title={`${detail.title} 預告片`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </Section>
        )}
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse px-4 sm:px-6">
      <div className="-mx-4 h-44 bg-gray-200 sm:-mx-6 sm:h-64" />
      <div className="-mt-12 flex items-end gap-4">
        <div className="aspect-[2/3] w-28 rounded-xl bg-gray-300 sm:w-36" />
        <div className="h-8 w-1/2 rounded bg-gray-200" />
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-5/6 rounded bg-gray-100" />
      </div>
    </div>
  );
}
