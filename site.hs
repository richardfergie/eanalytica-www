--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}
import Data.Monoid (mappend, (<>))
import Control.Monad
import Hakyll
import System.FilePath
import Data.List
import Text.Pandoc
import Text.Jasmine
import qualified Data.ByteString.Lazy.Char8 as C
import Hakyll.Web.Pandoc
import Text.Pandoc.SelfContained
import Text.Pandoc.Class (runIOorExplode)

--------------------------------------------------------------------------------
selfContainedPandocCompilerWith :: ReaderOptions -> WriterOptions -> Compiler (Item String)
selfContainedPandocCompilerWith readerOpts writerOpts = do
  item <- getResourceBody
  rpandoc <- readPandocWith readerOpts item
  let html = (writePandocWith writerOpts rpandoc)
  html' <- unsafeCompiler $ runIOorExplode $ makeSelfContained {-writerOpts-} (itemBody html)
  return $ item{itemBody=html'}

selfContainedPandocCompiler :: Compiler (Item String)
selfContainedPandocCompiler = selfContainedPandocCompilerWith defaultHakyllReaderOptions defaultHakyllWriterOptions

cleanDate :: Routes
cleanDate = customRoute removeDatePrefix

removeDatePrefix :: Identifier -> FilePath
removeDatePrefix ident = replaceFileName file (drop 11 $ takeFileName file)
   where file = toFilePath ident

blogRoute :: Routes
blogRoute  =
      gsubRoute "posts/" (const "blog/")
      `composeRoutes` cleanDate
      `composeRoutes` gsubRoute ".markdown" (const "/index.html")
      `composeRoutes` gsubRoute ".html" (const "/index.html")
      `composeRoutes` gsubRoute ".lhs" (const "/index.html")
      `composeRoutes` gsubRoute ".org" (const "/index.html")

notesRoute :: Routes
notesRoute =
  gsubRoute "notes/" (const "notes/")
      `composeRoutes` cleanDate
      `composeRoutes` gsubRoute ".md" (const "/index.html")
      `composeRoutes` gsubRoute ".markdown" (const "/index.html")
      `composeRoutes` gsubRoute ".html" (const "/index.html")
      `composeRoutes` gsubRoute ".lhs" (const "/index.html")
      `composeRoutes` gsubRoute ".org" (const "/index.html")

pagesRoute :: Routes
pagesRoute =
  gsubRoute "pages/" (const "")
      `composeRoutes` gsubRoute ".md" (const "/index.html")
      `composeRoutes` gsubRoute ".markdown" (const "/index.html")
      `composeRoutes` gsubRoute ".html" (const "/index.html")
      `composeRoutes` gsubRoute ".lhs" (const "/index.html")
      `composeRoutes` gsubRoute ".org" (const "/index.html")

slashUrlsCompiler :: Item String -> Compiler (Item String)
slashUrlsCompiler item = do
     route <- getRoute $ itemIdentifier item
     return $ case route of
         Nothing -> item
         Just r -> fmap slashUrls item

slashUrls :: String -> String
slashUrls = withUrls convert
  where
    convert = replaceAll "/index.html" (const "/")

makeId :: PageNumber -> Identifier
makeId pageNum = fromFilePath $ "blog/page/" ++ (show pageNum) ++ "/index.html"

makeNoteId pageNum = fromFilePath $ "notes/page/" ++ (show pageNum) ++ "/index.html"

grouper :: MonadMetadata m => [Identifier] -> m [[Identifier]]
grouper ids = (liftM (paginateEvery 5) . sortRecentFirst) ids

archiveRoute pageNum = case pageNum of
  1 -> constRoute "blog/index.html"
  x -> constRoute $ "blog/"++(show x)++"/index.html"

notesArchive pageNum = case pageNum of
  1 -> constRoute "notes/index.html"
  x -> constRoute $ "notes/"++(show x)++"/index.html"

introField :: Context String
introField = field "intro" $ \item -> do
    body <- itemBody <$> loadSnapshot (itemIdentifier item) "intro"
    return $ (maxLengthTeaser . compactTeaser) body
  where
    maxLengthTeaser :: String -> String
    maxLengthTeaser s = if findIndex (isPrefixOf "<!-- more -->") (tails s) == Nothing
                            then unwords (take 200 (words s))
                            else s
    compactTeaser :: String -> String
    compactTeaser =
        (replaceAll "<iframe [^>]*>" (const "")) .
        (replaceAll "<img [^>]*>" (const "")) .
        (replaceAll "<p>" (const "")) .
        (replaceAll "</p>" (const "")) .
        (replaceAll "<blockquote>" (const "")) .
        (replaceAll "</blockquote>" (const "")) .
        (replaceAll "<strong>" (const "")) .
        (replaceAll "</strong>" (const "")) .
        (replaceAll "<ol>" (const "")) .
        (replaceAll "</ol>" (const "")) .
        (replaceAll "<ul>" (const "")) .
        (replaceAll "</ul>" (const "")) .
        (replaceAll "<strike>" (const "")) .
        (replaceAll "</strike>" (const "")) .
        (replaceAll "<li>" (const "")) .
        (replaceAll "</li>" (const "")) .
        (replaceAll "<div[^>]*>" (const "")) .
        (replaceAll "</div>" (const "")) .
        (replaceAll "<h[0-9][^>]*>" (const "")) .
        (replaceAll "</h[0-9]>" (const "")) .
        (replaceAll "<pre.*" (const "")) .
        (replaceAll "<a [^>]*>" (const "")) .
        (replaceAll "</a>" (const "")) .
        (replaceAll "<hr>" (const ""))

rawRoute :: Routes
rawRoute = gsubRoute "raw/" (const "")
                `composeRoutes` gsubRoute ".html" (const "/index.html")
                `composeRoutes` gsubRoute ".markdown" (const "/index.html")
                `composeRoutes` gsubRoute ".lhs" (const "/index.html")

minifyJSCompiler = do
   s <- getResourceString
   return $ itemSetBody (minifyJS s) s

minifyJS = C.unpack . minify . C.pack . itemBody


main :: IO ()
main = hakyll $ do
    match "images/*" $ do
        route   idRoute
        compile copyFileCompiler

    match "files/*" $ do
      route idRoute
      compile copyFileCompiler

    match "css/*" $ do
        route   idRoute
        compile compressCssCompiler

    match "js/**" $ do
      route idRoute
      compile minifyJSCompiler

    match "raw/*" $ do
      route rawRoute
      compile copyFileCompiler

    match "google49c11d79480ceef2.html" $ do
      route idRoute
      compile copyFileCompiler

    match "robots.txt" $ do
      route idRoute
      compile copyFileCompiler

    match "posts/*" $ do
        route blogRoute
        compile $ pandocCompiler
            >>= saveSnapshot "intro"
            >>= loadAndApplyTemplate "templates/post.html"    postCtx
            >>= saveSnapshot "feed"
            >>= loadAndApplyTemplate "templates/default.html" postCtx
            >>= slashUrlsCompiler

    match "notes/*" $ do
        route notesRoute
        compile $ selfContainedPandocCompiler
            >>= saveSnapshot "intro"
            >>= loadAndApplyTemplate "templates/post.html"    noteCtx
            >>= loadAndApplyTemplate "templates/default.html" noteCtx
            >>= relativizeUrls
            >>= slashUrlsCompiler

    pag <- buildPaginateWith grouper "posts/*" makeId

    notes <- buildPaginateWith grouper "notes/*" makeNoteId

    paginateRules pag $ \pageNum pattern -> do
        route $ archiveRoute pageNum
        compile $ do
            posts <- recentFirst =<< loadAll pattern
            let paginateCtx = paginateContext pag pageNum
                title = case pageNum of
                  1 -> "Archive"
                  x -> "Archive - Page "++(show x)
                ctx = constField "title" title <>
                      listField "posts" (postCtx <> introField) (return posts) <>
                      field "blog" (const $ return "blog") <>
                      paginateCtx <>
                      defaultContext
            makeItem ""
                >>= loadAndApplyTemplate "templates/archive.html" ctx
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= relativizeUrls
                >>= slashUrlsCompiler

    paginateRules notes $ \pageNum pattern -> do
        route $ notesArchive pageNum
        compile $ do
            posts <- recentFirst =<< loadAll pattern
            let paginateCtx = paginateContext notes pageNum
                title = case pageNum of
                  1 -> "Notes"
                  x -> "Notes - Page "++(show x)
                ctx = constField "title" title <>
                      listField "posts" (noteCtx <> introField) (return posts) <>
                      field "notes" (const $ return "notes") <>
                      paginateCtx <>
                      defaultContext
            makeItem ""
                >>= loadAndApplyTemplate "templates/notes.html" ctx
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= relativizeUrls
                >>= slashUrlsCompiler

    match "site.lhs" $ do --won't match unless this file is .lhs
       route (constRoute "site/index.html")
       compile $ do
         let ctx = field "title" (\_ -> return "Hakyll code for this site") <> defaultContext
             pandocWriteOptions = defaultHakyllWriterOptions
               { writerReferenceLinks = True
               }
         pandocCompilerWith defaultHakyllReaderOptions pandocWriteOptions
           >>= loadAndApplyTemplate "templates/page.html" ctx
           >>= loadAndApplyTemplate "templates/default.html" ctx
           >>= slashUrlsCompiler

    match "index.html" $ do
        route idRoute
        let ctx = field "home" (const $ return "home") <> defaultContext
        compile $ do
            getResourceBody
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= slashUrlsCompiler

    match "pages/*" $ do
        route pagesRoute
        compile $ do
          fpath <- getResourceFilePath
          let basepath = takeBaseName fpath
          let ctx = field basepath (const $ return basepath) <> defaultContext
          pandocCompiler
            >>= loadAndApplyTemplate "templates/default.html" ctx
            >>= slashUrlsCompiler

    match "favicon.ico" $ do
      route   idRoute
      compile copyFileCompiler

    create ["sitemap.xml"] $ do
         route   idRoute
         compile $ do
           posts <- recentFirst =<< loadAll "posts/*"
           notes <- recentFirst =<< loadAll "notes/*"
           raw <- (loadAll "raw/*")::(Compiler [Item CopyFile])
           let sitemapCtx = mconcat
                            [ listField "rawentries"
                                        (field "url" (return .
                                                      (replaceAll ".html" (const "/")) .
                                                      (drop 4) .
                                                      toFilePath .
                                                      itemIdentifier)) $ return raw
                            , listField "blogentries"
                                        (mapContext (replaceAll "/index.html" (const "/")) postCtx)
                                        $ return $ posts++notes
                            , defaultContext
                            ]
           makeItem ""
            >>= loadAndApplyTemplate "templates/sitemap.xml" sitemapCtx
             >>= slashUrlsCompiler

    -- FIXME: currently links to /index.html
    create ["blog/rss.xml"] $ do
      route idRoute
      compile $ do
        let feedCtx = postCtx `mappend` bodyField "description"
        posts <- fmap (take 10) . recentFirst =<<
                 loadAllSnapshots "posts/*" "feed"
        renderRss (FeedConfiguration "E-Analytica"
                                     "Data"
                                     "Richard Fergie"
                                     "fergie@eanalytica.com"
                                     "https://www.eanalytica.com"
                  ) feedCtx posts

    match "templates/*" $ compile templateCompiler


--------------------------------------------------------------------------------
postCtx :: Context String
postCtx =
    dateField "date" "%B %e, %Y" <>
    dateField "lastmod" "%Y-%m-%d" <>
    field "blog" (const $ return "blog") <>
    defaultContext

noteCtx :: Context String
noteCtx =
    dateField "date" "%B %e, %Y" <>
    dateField "lastmod" "%Y-%m-%d" <>
    field "notes" (const $ return "notes") <>
    defaultContext
