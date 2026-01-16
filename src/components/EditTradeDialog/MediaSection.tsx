import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Video, Mic, RotateCcw, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { getMediaType, type MediaType } from '@/hooks/useTradeMedia';
import { cn } from '@/lib/utils';

interface ExistingMedia {
  url: string;
  type: MediaType;
}

interface NewMedia {
  file: File;
  type: MediaType;
  preview: string;
}

interface MediaSectionProps {
  language: string;
  existingMedia: ExistingMedia[];
  mediaToDelete: string[];
  newMediaItems: NewMedia[];
  onNewMediaUpload: (items: NewMedia[]) => void;
  onRemoveExistingMedia: (url: string) => void;
  onRestoreExistingMedia: (url: string) => void;
  onRemoveNewMedia: (index: number) => void;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  language,
  existingMedia,
  mediaToDelete,
  newMediaItems,
  onNewMediaUpload,
  onRemoveExistingMedia,
  onRestoreExistingMedia,
  onRemoveNewMedia,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: NewMedia[] = [];

    for (const file of Array.from(files)) {
      const type = getMediaType(file);
      if (!type) {
        toast.error(language === 'fr' 
          ? `Type de fichier non supporté: ${file.name}` 
          : `Unsupported file type: ${file.name}`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      newItems.push({ file, type, preview });
    }

    onNewMediaUpload(newItems);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleAudioPlay = (url: string) => {
    const audio = audioRefs.current.get(url);
    if (!audio) return;

    if (playingAudio === url) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        const currentAudio = audioRefs.current.get(playingAudio);
        currentAudio?.pause();
      }
      audio.play();
      setPlayingAudio(url);
    }
  };

  const handleAudioEnded = (url: string) => {
    if (playingAudio === url) {
      setPlayingAudio(null);
    }
  };

  const existingImages = existingMedia.filter(m => m.type === 'image');
  const existingVideos = existingMedia.filter(m => m.type === 'video');
  const existingAudios = existingMedia.filter(m => m.type === 'audio');
  const newImages = newMediaItems.filter(m => m.type === 'image');
  const newVideos = newMediaItems.filter(m => m.type === 'video');
  const newAudios = newMediaItems.filter(m => m.type === 'audio');

  const renderMediaItem = (
    url: string, 
    type: MediaType, 
    isNew: boolean, 
    index: number,
    isMarkedForDeletion: boolean = false
  ) => {
    return (
      <div 
        key={url} 
        className={cn(
          "relative group rounded-lg overflow-hidden border border-border",
          type === 'audio' ? "aspect-[2/1]" : "aspect-video",
          isMarkedForDeletion && "opacity-30 grayscale"
        )}
      >
        {type === 'image' && (
          <img
            src={url}
            alt={`Media ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {type === 'video' && (
          <>
            <video
              src={url}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                <Play className="w-4 h-4 text-black ml-0.5" />
              </div>
            </div>
          </>
        )}

        {type === 'audio' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/30 p-2">
            <audio
              ref={(el) => {
                if (el) audioRefs.current.set(url, el);
              }}
              src={url}
              onEnded={() => handleAudioEnded(url)}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => toggleAudioPlay(url)}
              className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30"
              disabled={isMarkedForDeletion}
            >
              {playingAudio === url ? (
                <Pause className="w-4 h-4 text-primary" />
              ) : (
                <Play className="w-4 h-4 text-primary" />
              )}
            </Button>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-1 left-1">
          <div className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-medium",
            type === 'image' && "bg-blue-500/80 text-white",
            type === 'video' && "bg-purple-500/80 text-white",
            type === 'audio' && "bg-amber-500/80 text-white"
          )}>
            {type === 'image' && <ImageIcon className="w-3 h-3" />}
            {type === 'video' && <Video className="w-3 h-3" />}
            {type === 'audio' && <Mic className="w-3 h-3" />}
          </div>
        </div>

        {/* Action Button */}
        {isMarkedForDeletion ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRestoreExistingMedia(url)}
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => isNew ? onRemoveNewMedia(index) : onRemoveExistingMedia(url)}
          >
            <X className="w-3 h-3" />
          </Button>
        )}

        {isMarkedForDeletion && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-loss bg-background/80 px-1 rounded">
              {language === 'fr' ? 'Supprimé' : 'Deleted'}
            </span>
          </div>
        )}
      </div>
    );
  };

  const activeExisting = existingMedia.filter(m => !mediaToDelete.includes(m.url));
  const totalCount = activeExisting.length + newMediaItems.length;

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        {language === 'fr' ? 'Médias' : 'Media'}
      </Label>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          {existingImages.filter(m => !mediaToDelete.includes(m.url)).length + newImages.length} {language === 'fr' ? 'image(s)' : 'image(s)'}
        </span>
        <span className="flex items-center gap-1">
          <Video className="w-3 h-3" />
          {existingVideos.filter(m => !mediaToDelete.includes(m.url)).length + newVideos.length} {language === 'fr' ? 'vidéo(s)' : 'video(s)'}
        </span>
        <span className="flex items-center gap-1">
          <Mic className="w-3 h-3" />
          {existingAudios.filter(m => !mediaToDelete.includes(m.url)).length + newAudios.length} {language === 'fr' ? 'audio(s)' : 'audio(s)'}
        </span>
      </div>

      {/* Existing Media */}
      {existingMedia.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {language === 'fr' ? 'Médias existants:' : 'Existing media:'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {existingMedia.map((media, idx) => 
              renderMediaItem(
                media.url, 
                media.type, 
                false, 
                idx,
                mediaToDelete.includes(media.url)
              )
            )}
          </div>
        </div>
      )}

      {/* New Media */}
      {newMediaItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {language === 'fr' ? 'Nouveaux médias:' : 'New media:'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {newMediaItems.map((media, idx) => 
              renderMediaItem(media.preview, media.type, true, idx)
            )}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="edit-trade-media"
        />
        <label htmlFor="edit-trade-media">
          <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
            <span>
              <Upload className="w-4 h-4" />
              {language === 'fr' ? 'Ajouter des médias' : 'Add media'}
            </span>
          </Button>
        </label>
        <span className="text-xs text-muted-foreground">
          {totalCount} {language === 'fr' ? 'fichier(s)' : 'file(s)'}
        </span>
      </div>
    </div>
  );
};
