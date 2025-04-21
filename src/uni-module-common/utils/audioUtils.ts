// ----------------------------------1. 使用 plus.io API 处理文件路径----------------------------------
// 处理下载的音频文件
function handleDownloadedAudio(tempFilePath: string) {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    plus.io.resolveLocalFileSystemURL(
      tempFilePath,
      (entry: any) => {
        // 获取到真实的文件对象
        entry.file(
          (file: any) => {
            console.log('文件信息:', file.size, file.name);
            // 返回可用的文件路径
            resolve(tempFilePath);
          },
          (error: any) => {
            console.error('获取文件信息失败:', error);
            reject(error);
          }
        );
      },
      (error: any) => {
        console.error('解析文件路径失败:', error);
        reject(error);
      }
    );
    // #endif

    // #ifndef APP-PLUS
    // 非App平台直接返回路径
    resolve(tempFilePath);
    // #endif
  });
}

// 下载并播放音频
export function downloadAndPlayAudio(url: string) {
  uni.showLoading({ title: '加载中...' });

  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('下载成功，临时路径:', res.tempFilePath);

          handleDownloadedAudio(res.tempFilePath)
            .then((validPath) => {
              const audioContext: any = uni.createInnerAudioContext();
              audioContext.src = validPath;

              audioContext.onCanplay(() => {
                console.log('音频准备就绪');
                uni.hideLoading();
              });

              audioContext.onError((err: any) => {
                console.error('音频播放错误:', err);
                uni.hideLoading();
                uni.showToast({
                  title: '音频播放失败',
                  icon: 'none'
                });
                reject(err);
              });

              resolve(audioContext);
            })
            .catch((err) => {
              uni.hideLoading();
              reject(err);
            });
        } else {
          uni.hideLoading();
          uni.showToast({
            title: `下载失败，状态码:${res.statusCode}`,
            icon: 'none'
          });
          reject(new Error(`下载失败，状态码:${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error('下载失败:', err);
        uni.hideLoading();
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

// ----------------------------------2. 使用 saveFile 将临时文件保存为永久文件----------------------------------
// 将临时文件保存为永久文件
function saveAudioFile(tempFilePath: string) {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    const fileName = `audio_${Date.now()}.mp3`;
    uni.saveFile({
      tempFilePath,
      success: (res) => {
        console.log('文件保存成功:', res.savedFilePath);
        resolve(res.savedFilePath);
      },
      fail: (err) => {
        console.error('文件保存失败:', err);
        // 如果保存失败，尝试直接使用临时文件
        resolve(tempFilePath);
      }
    });
    // #endif

    // #ifndef APP-PLUS
    resolve(tempFilePath);
    // #endif
  });
}

// 下载并播放音频
export function downloadAndPlayAudio1(url: string) {
  uni.showLoading({ title: '加载中...' });

  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('下载成功，临时路径:', res.tempFilePath);

          // 保存为永久文件
          saveAudioFile(res.tempFilePath)
            .then((savedPath) => {
              const audioContext: any = uni.createInnerAudioContext();
              audioContext.src = savedPath;

              audioContext.onCanplay(() => {
                console.log('音频准备就绪');
                uni.hideLoading();
              });

              audioContext.onError((err: any) => {
                console.error('音频播放错误:', err);
                uni.hideLoading();
                uni.showToast({
                  title: '音频播放失败',
                  icon: 'none'
                });
                reject(err);
              });

              resolve(audioContext);
            })
            .catch((err) => {
              uni.hideLoading();
              reject(err);
            });
        } else {
          uni.hideLoading();
          reject(new Error(`下载失败，状态码:${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error('下载失败:', err);
        uni.hideLoading();
        reject(err);
      }
    });
  });
}

// ----------------------------------3. 使用 plus.audio 接口直接播放----------------------------------
// 使用plus.audio播放音频
export function playAudioWithPlus(url: string) {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    uni.showLoading({ title: '加载中...' });

    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('下载成功，临时路径:', res.tempFilePath);

          // 使用plus.audio播放
          const player = plus.audio.createPlayer(res.tempFilePath);
          player.play(
            () => {
              console.log('播放完成');
            },
            (e) => {
              console.error('播放错误:', e.message);
              uni.showToast({
                title: `播放错误: ${e.message}`,
                icon: 'none'
              });
              reject(e);
            }
          );
          uni.hideLoading();
          resolve(player);
        } else {
          uni.hideLoading();
          reject(new Error(`下载失败，状态码:${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error('下载失败:', err);
        uni.hideLoading();
        reject(err);
      }
    });
    // #endif

    // #ifndef APP-PLUS
    // 非App平台使用普通方式播放
    const audioContext = uni.createInnerAudioContext();
    audioContext.src = url;
    audioContext.autoplay = true;
    resolve(audioContext);
    // #endif
  });
}

// ----------------------------------4. 完整的音频播放组件示例----------------------------------
//   <template>
//   <view class="audio-player">
//     <view class="audio-controls">
//       <button @click="togglePlay" :disabled="!isReady">
//         {{ isPlaying ? '暂停' : '播放' }}
//       </button>
//       <text>{{ currentTimeText }} / {{ durationText }}</text>
//     </view>
//   </view>
// </template>

// <script>
// export default {
//   props: {
//     audioUrl: {
//       type: String,
//       required: true
//     }
//   },
//   data() {
//     return {
//       audioContext: null,
//       plusPlayer: null,
//       isPlaying: false,
//       isReady: false,
//       currentTime: 0,
//       duration: 0
//     }
//   },
//   computed: {
//     currentTimeText() {
//       return this.formatTime(this.currentTime);
//     },
//     durationText() {
//       return this.formatTime(this.duration);
//     }
//   },
//   watch: {
//     audioUrl: {
//       immediate: true,
//       handler(newUrl) {
//         if (newUrl) {
//           this.initAudio(newUrl);
//         }
//       }
//     }
//   },
//   methods: {
//     initAudio(url) {
//       this.isReady = false;
//       this.isPlaying = false;

//       // 销毁之前的实例
//       this.destroyAudio();

//       // #ifdef APP-PLUS
//       this.initAppAudio(url);
//       // #endif

//       // #ifndef APP-PLUS
//       this.initNormalAudio(url);
//       // #endif
//     },

//     initAppAudio(url) {
//       uni.showLoading({ title: '加载中...' });

//       uni.downloadFile({
//         url: url,
//         success: (res) => {
//           if (res.statusCode === 200) {
//             console.log('下载成功，临时路径:', res.tempFilePath);

//             // 保存为永久文件
//             uni.saveFile({
//               tempFilePath: res.tempFilePath,
//               success: (saveRes) => {
//                 console.log('文件保存成功:', saveRes.savedFilePath);

//                 try {
//                   // 使用plus.audio播放
//                   this.plusPlayer = plus.audio.createPlayer(saveRes.savedFilePath);

//                   // 设置状态更新定时器
//                   this.statusTimer = setInterval(() => {
//                     if (this.plusPlayer && this.isPlaying) {
//                       this.currentTime = this.plusPlayer.getPosition();
//                       this.duration = this.plusPlayer.getDuration();
//                     }
//                   }, 500);

//                   this.isReady = true;
//                   uni.hideLoading();
//                 } catch (e) {
//                   console.error('创建播放器失败:', e);
//                   uni.hideLoading();
//                   uni.showToast({
//                     title: '创建播放器失败',
//                     icon: 'none'
//                   });
//                 }
//               },
//               fail: (err) => {
//                 console.error('文件保存失败:', err);
//                 // 如果保存失败，尝试直接使用临时文件
//                 this.tryPlayWithTempFile(res.tempFilePath);
//               }
//             });
//           } else {
//             uni.hideLoading();
//             uni.showToast({
//               title: '下载失败，状态码:' + res.statusCode,
//               icon: 'none'
//             });
//           }
//         },
//         fail: (err) => {
//           console.error('下载失败:', err);
//           uni.hideLoading();
//           uni.showToast({
//             title: '下载失败',
//             icon: 'none'
//           });
//         }
//       });
//     },

//     tryPlayWithTempFile(tempFilePath) {
//       try {
//         // 尝试直接使用临时文件
//         this.plusPlayer = plus.audio.createPlayer(tempFilePath);

//         // 设置状态更新定时器
//         this.statusTimer = setInterval(() => {
//           if (this.plusPlayer && this.isPlaying) {
//             this.currentTime = this.plusPlayer.getPosition();
//             this.duration = this.plusPlayer.getDuration();
//           }
//         }, 500);

//         this.isReady = true;
//         uni.hideLoading();
//       } catch (e) {
//         console.error('创建播放器失败:', e);
//         uni.hideLoading();
//         uni.showToast({
//           title: '创建播放器失败',
//           icon: 'none'
//         });
//       }
//     },

//     initNormalAudio(url) {
//       this.audioContext = uni.createInnerAudioContext();
//       this.audioContext.src = url;

//       this.audioContext.onCanplay(() => {
//         console.log('音频准备就绪');
//         this.isReady = true;
//       });

//       this.audioContext.onTimeUpdate(() => {
//         this.currentTime = this.audioContext.currentTime;
//         this.duration = this.audioContext.duration;
//       });

//       this.audioContext.onEnded(() => {
//         this.isPlaying = false;
//       });

//       this.audioContext.onError((err) => {
//         console.error('音频播放错误:', err);
//         uni.showToast({
//           title: '音频播放失败',
//           icon: 'none'
//         });
//       });
//     },

//     togglePlay() {
//       if (!this.isReady) return;

//       this.isPlaying = !this.isPlaying;

//       // #ifdef APP-PLUS
//       if (this.plusPlayer) {
//         if (this.isPlaying) {
//           this.plusPlayer.play();
//         } else {
//           this.plusPlayer.pause();
//         }
//       }
//       // #endif

//       // #ifndef APP-PLUS
//       if (this.audioContext) {
//         if (this.isPlaying) {
//           this.audioContext.play();
//         } else {
//           this.audioContext.pause();
//         }
//       }
//       // #endif
//     },

//     formatTime(seconds) {
//       seconds = Math.floor(seconds || 0);
//       const minutes = Math.floor(seconds / 60);
//       seconds = seconds % 60;
//       return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//     },

//     destroyAudio() {
//       // #ifdef APP-PLUS
//       if (this.plusPlayer) {
//         this.plusPlayer.stop();
//         this.plusPlayer = null;
//       }

//       if (this.statusTimer) {
//         clearInterval(this.statusTimer);
//         this.statusTimer = null;
//       }
//       // #endif

//       // #ifndef APP-PLUS
//       if (this.audioContext) {
//         this.audioContext.destroy();
//         this.audioContext = null;
//       }
//       // #endif
//     }
//   },
//   beforeDestroy() {
//     this.destroyAudio();
//   }
// }
// </script>

// <style>
// .audio-player {
//   padding: 10px;
//   border: 1px solid #eee;
//   border-radius: 5px;
//   margin: 10px 0;
// }
// .audio-controls {
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
// }
// </style>
