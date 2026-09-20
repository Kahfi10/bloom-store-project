import os
import subprocess
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
video_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'videos')
videos = ['video1.mp4', 'video2.mp4', 'video3.mp4']

print("Memulai kompresi video hero...")
total_orig = 0
total_opt = 0

for v in videos:
    input_path = os.path.join(video_dir, v)
    temp_path = os.path.join(video_dir, f'opt_{v}')
    
    if not os.path.exists(input_path):
        continue
        
    orig_size = os.path.getsize(input_path)
    total_orig += orig_size
    
    cmd = [
        ffmpeg, '-y', '-i', input_path,
        '-vf', 'scale=-2:720',
        '-c:v', 'libx264', '-crf', '26', '-preset', 'veryfast',
        '-an', '-movflags', '+faststart',
        temp_path
    ]
    
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode == 0:
        opt_size = os.path.getsize(temp_path)
        os.replace(temp_path, input_path)
        total_opt += opt_size
        saved_mb = (orig_size - opt_size) / (1024 * 1024)
        pct = (1 - opt_size / orig_size) * 100
        print(f"[OK] {v}: {orig_size/(1024*1024):.2f} MB -> {opt_size/(1024*1024):.2f} MB (Hemat {saved_mb:.2f} MB / {pct:.1f}%)")
    else:
        total_opt += orig_size
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"[ERR] Gagal mengompresi {v}")

# Extract poster frame from video1.mp4
poster_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'images', 'hero-poster.jpg')
cmd_poster = [
    ffmpeg, '-y', '-ss', '00:00:01', '-i', os.path.join(video_dir, 'video1.mp4'),
    '-vframes', '1', '-q:v', '2', '-vf', 'scale=1280:-2',
    poster_path
]
subprocess.run(cmd_poster, capture_output=True)
if os.path.exists(poster_path):
    print(f"[OK] Hero poster berhasil diekstrak: {os.path.getsize(poster_path)/1024:.1f} KB")

# Cleanup any video1_opt.mp4
test_opt = os.path.join(video_dir, 'video1_opt.mp4')
if os.path.exists(test_opt):
    os.remove(test_opt)

orig_mb = total_orig / (1024 * 1024)
opt_mb = total_opt / (1024 * 1024)
saved_mb = orig_mb - opt_mb
pct_total = (saved_mb / orig_mb) * 100

print("====================================")
print(f"SELESAI! Video hero dioptimasi.")
print(f"Ukuran sebelum : {orig_mb:.2f} MB")
print(f"Ukuran setelah : {opt_mb:.2f} MB")
print(f"Total dihemat  : {saved_mb:.2f} MB ({pct_total:.1f}%)")
print("====================================")
